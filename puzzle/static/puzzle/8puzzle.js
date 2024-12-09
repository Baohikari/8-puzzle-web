$(document).ready(function () {
    let tiles = [];
    let emptyTile = null;
    let moves = 0;
    let boardState = [];

    const tileSize = 179; // Kích thước của một ô

    // Tạo các ô (tile) động
    function createTiles() {
        for (let i = 0; i < 9; i++) {
            let tile = $('<div class="tile animated"><span></span></div>');
            if (i === 8) {
                tile.addClass('empty');
                emptyTile = tile;
            } else {
                tile.find('span').text(i + 1);
                tile.attr('id', `tile_${i}`);
            }
            $('#board').append(tile);
            tiles.push(tile);
        }
    }

    // Đặt lại vị trí ban đầu của các ô
    function resetTilePositions() {
        tiles.forEach((tile, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            tile.css({
                top: row * tileSize,
                left: col * tileSize,
                width: tileSize,
                height: tileSize
            });
            boardState[index] = index + 1;
        });
        boardState[8] = 0;
        emptyTile.css({
            top: 2 * tileSize,
            left: 2 * tileSize,
            width: tileSize,
            height: tileSize
        });
    }

    // Kiểm tra trạng thái puzzle có thể giải được hay không
    function isSolvable(puzzle) {
        let inversions = 0;
        for (let i = 0; i < puzzle.length; i++) {
            for (let j = i + 1; j < puzzle.length; j++) {
                if (puzzle[i] > 0 && puzzle[j] > 0 && puzzle[i] > puzzle[j]) {
                    inversions++;
                }
            }
        }
        return inversions % 2 === 0;
    }

    // Xáo trộn các ô cho đến khi tìm thấy trạng thái có thể giải được
    function shuffle() {
        let shuffled;
        do {
            shuffled = [...Array(9).keys()].sort(() => Math.random() - 0.5);
        } while (!isSolvable(shuffled));

        for (let i = 0; i < tiles.length; i++) {
            const newIndex = shuffled[i];
            const tile = tiles[i];
            tile.css({
                top: Math.floor(newIndex / 3) * tileSize,
                left: (newIndex % 3) * tileSize
            });
            boardState[newIndex] = i + 1;
        }
        boardState[shuffled[8]] = 0;
        emptyTile.css({
            top: Math.floor(shuffled[8] / 3) * tileSize,
            left: (shuffled[8] % 3) * tileSize
        });
        moves = 0;
        $('#user-steps').text('Số bước đi: ' + moves);
    }

    // Kiểm tra xem ô có kề với ô trống không
    function isAdjacent(tile) {
        const tilePos = tile.position();
        const emptyPos = emptyTile.position();
        const distance = Math.abs(tilePos.top - emptyPos.top) + Math.abs(tilePos.left - emptyPos.left);
        return distance === tileSize;
    }

    // Di chuyển ô
    function moveTile(tile) {
        if (!tile) {
            console.error('Invalid tile:', tile);
            return;
        }

        if (isAdjacent(tile)) {
            const tilePos = tile.position();
            const emptyPos = emptyTile.position();

            tile.css({ top: emptyPos.top, left: emptyPos.left });
            emptyTile.css({ top: tilePos.top, left: tilePos.left });

            // Update boardState
            const emptyIndex = boardState.indexOf(0);
            const tileIndex = boardState.indexOf(parseInt(tile.find('span').text()));

            [boardState[emptyIndex], boardState[tileIndex]] = [boardState[tileIndex], boardState[emptyIndex]];

            moves++;
            $('#user-steps').text('Số bước đi: ' + moves);
            if (checkWin()) {
                alert('Chúc mừng! Bạn đã chiến thắng!');
            }
        }
    }

    // Kiểm tra trò chơi đã kết thúc chưa
    function checkWin() {
        for (let i = 0; i < 8; i++) {
            if (boardState[i] !== i + 1) {
                return false;
            }
        }
        return true;
    }

    //Bắt kết quả từ server
    async function fetchSolution(puzzle){
        try {
            const response = await fetch('/solve_puzzle/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken(),
                },
                body: JSON.stringify({ puzzle: puzzle })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error from server:', errorData);
                throw new Error(errorData.error);
            }

            const data = await response.json();
            console.log('Received move directions from AI:', data.move_directions);
            animateSolutionSteps(data.move_directions);
        } catch (error) {
            console.error('Error fetching solution:', error);
            throw error;
        }
    }

    // Hoạt ảnh giải quyết trò chơi
    async function animateSolutionSteps(moveDirections) {
        for (let i = 0; i < moveDirections.length; i++) {
            const moveDirection = moveDirections[i];
            await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust timing if needed
            console.log(moveDirection)
            switch (moveDirection) {
                case 1:
                    moveTileLeft();
                    break;
                case 2:
                    moveTileRight();
                    break;
                case 3:
                    moveTileUp();
                    break;
                case 4:
                    moveTileDown();
                    break;
                default:
                    console.error('Unknown move direction:', moveDirection);
                    break;
            }
        }
    }

    //Chuyển ô trống sang trái
    function moveTileLeft(){
        const emptyIndex = boardState.indexOf(0);
        const targetIndex = emptyIndex - 1;

        if (emptyIndex % 3 > 0) {
            console.log("Move Left " + targetIndex)
            moveTile(tiles[boardState[targetIndex] - 1]);
        }

    }

    //Chuyển ô trống sang phải
    function moveTileRight(){
        const emptyIndex = boardState.indexOf(0);
        const targetIndex = emptyIndex + 1;

        if (emptyIndex % 3 < 2) {
            console.log("Move Right " + targetIndex)
            moveTile(tiles[boardState[targetIndex] - 1]);
        }

    }

    //Chuyển ô trống lên trên
    function moveTileUp(){
        const emptyIndex = boardState.indexOf(0);
        const targetIndex = emptyIndex - 3;

        if (emptyIndex >= 3) {
            console.log("Move Up " + targetIndex)
            moveTile(tiles[boardState[targetIndex] - 1]);
        }

    }

    //Chuyển ô trống xuống dưới
    function moveTileDown(){
        const emptyIndex = boardState.indexOf(0);
        const targetIndex = emptyIndex + 3;

        if (emptyIndex < 6) {
            console.log("Move Down " + targetIndex)
            moveTile(tiles[boardState[targetIndex] - 1]);
        }

    }

    function getCsrfToken(){
        let cookieValue = null;
        if(document.cookie && document.cookie !== ''){
            const cookies = document.cookie.split(';');
            for(let i = 0; i < cookies.length; i++){
                const cookie = cookies[i].trim();
                if(cookie.substring(0, 'crsftoken'.length + 1) == 'crsftoken'){
                    cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Khởi tạo trò chơi
    createTiles();
    resetTilePositions();

    // Thêm sự kiện click cho các ô
    tiles.forEach(tile => {
        tile.click(event => {
            event.preventDefault();
            moveTile(tile);
        });
    });

    // Xử lý sự kiện click cho các nút
    $('#new').click(shuffle);

    $('#submit').click(() => {
        if (checkWin()) {
            alert('Chúc mừng! Bạn đã chiến thắng!');
        } else {
            alert('Bạn chưa hoàn thành trò chơi!');
        }
    });

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    $('#ai').click(function () {
        let board = [];
        for (let i = 0; i < 9; i++) {
            board.push(boardState[i]);
        }

        console.log('Gửi board:', board);

        $.ajax({
            url: '/solve_puzzle/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ puzzle: board }),
            headers: { 'X-CSRFToken': csrftoken },
            success: function (response) {
                let solution = response.solution;
                $('#ai-steps').text('Số bước AI giải: ' + solution.length);
            },
            error: function (error) {
                console.error('Error:', error);
            }
        });
    });

    // Xử lý tải ảnh lên và cắt ảnh
    $('#uploadInput-btn').click(function () {
        $('#uploadInput').click();
    });

    $('#uploadInput').change(function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const boardSize = tileSize * 3;  // Kích thước của toàn bộ board (3x3)
                    const scale = Math.max(boardSize / img.width, boardSize / img.height);  // Tính tỷ lệ co dãn
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    for (let i = 0; i < 9; i++) {
                        if (i === 8) continue; // Bỏ qua ô trống

                        const row = Math.floor(i / 3);
                        const col = i % 3;

                        canvas.width = tileSize;
                        canvas.height = tileSize;

                        ctx.drawImage(img, col * tileSize / scale, row * tileSize / scale, tileSize / scale, tileSize / scale, 0, 0, tileSize, tileSize);

                        const tile = tiles[i];
                        tile.css('background-image', `url(${canvas.toDataURL()})`);
                    }

                    resetTilePositions();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    //Xử lí sự kiện "Nhờ AI giải"
    $('#ai-helper').click(async function(){
        const puzzle = boardState.slice();
        console.log('Sending puzzle to AI: ', puzzle);
        try{
            await fetchSolution(puzzle);
        } catch (error){
            console.log('Error fetching solution: ', error);
        }
    });

    // Xử lý sự kiện thay đổi trạng thái checkbox hiển thị số
    $('#shownumber').change(function () {
        if ($(this).is(':checked')) {
            $('#board').removeClass('hide-numbers').addClass('show-tiles');
        } else {
            $('#board').removeClass('show-tiles').addClass('hide-numbers');
        }
    });

    // Khởi tạo trạng thái ban đầu
    $('#shownumber').trigger('change');
});

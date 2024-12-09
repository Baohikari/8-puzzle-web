from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .ai_algorithm import PuzzleAI
import json
import logging

# Thiết lập logging
logger = logging.getLogger(__name__)

def index(request):
    return render(request, 'puzzle/index.html')

@csrf_exempt
def shuffle_puzzle(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            puzzle = data.get('puzzle', [])
            logger.debug(f"Nhận trạng thái shuffle: {puzzle}")

            # Xử lý trạng thái shuffle ở đây và chuyển tiếp cho thuật toán A*
            ai = PuzzleAI(puzzle)
            if ai.solve():
                solution_steps = ai.get_solution_steps()
                return JsonResponse({'solution': solution_steps}, safe=False)
            else:
                return JsonResponse({'error': 'Không tìm thấy giải pháp'}, status=400)
        except json.JSONDecodeError:
            logger.error("Không thể giải mã JSON")
            return JsonResponse({'error': 'JSON không hợp lệ'}, status=400)
        except Exception as e:
            logger.error(f"Lỗi khi giải puzzle: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Yêu cầu không hợp lệ'}, status=400)

@csrf_exempt
def solve_puzzle(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            puzzle = data.get('puzzle', [])
            logger.debug(f"Nhận puzzle: {puzzle}")

            if not puzzle or len(puzzle) != 9:
                return JsonResponse({'error': 'Dữ liệu puzzle không hợp lệ'}, status=400)

            ai = PuzzleAI(puzzle)
            if ai.solve():
                solution_steps = ai.get_solution_steps()
                move_directions = ai.get_move_directions()
                steps = [{'puzzle': step, 'move': move} for step, move in zip(solution_steps, move_directions)]
                return JsonResponse({'solution': steps, 'move_directions': move_directions}, safe=False)
            else:
                return JsonResponse({'error': 'Không tìm thấy giải pháp'}, status=400)
        except json.JSONDecodeError:
            logger.error("Không thể giải mã JSON")
            return JsonResponse({'error': 'JSON không hợp lệ'}, status=400)
        except Exception as e:
            logger.error(f"Lỗi khi giải puzzle: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Yêu cầu không hợp lệ'}, status=400)


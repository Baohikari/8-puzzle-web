from collections import deque

class Node:
    def __init__(self, parent, puzzle, move, move_code, g):
        self.parent = parent
        self.puzzle = puzzle
        self.move = move
        self.move_code = move_code
        self.children = []
        self.g = g
        self.h = 0

    def __lt__(self, other):
        return (self.g + self.h) < (other.g + other.h)

    def set_heuristic(self, goal_puzzle):
        self.h = self.manhattan_distance(goal_puzzle)

    def manhattan_distance(self, goal_puzzle):
        distance = 0
        for num in range(1, 9):
            current_index = self.puzzle.index(num)
            goal_index = goal_puzzle.index(num)
            distance += abs(current_index % 3 - goal_index % 3) + abs(current_index // 3 - goal_index // 3)
        return distance

class PuzzleAI:
    def __init__(self, puzzle):
        self.puzzle = puzzle
        self.goal = [1, 2, 3, 4, 5, 6, 7, 8, 0]
        self.open_queue = deque()
        self.closed_set = set()
        self.solution_steps = []
        self.move_directions = []  # Store the move directions

    def possible_moves(self, puzzle):
        index = puzzle.index(0)
        moves = []
        if index % 3 != 0:
            new_puzzle = puzzle[:]
            new_puzzle[index], new_puzzle[index - 1] = new_puzzle[index - 1], new_puzzle[index]
            moves.append((new_puzzle, 1))  # Left move
        if index % 3 != 2:
            new_puzzle = puzzle[:]
            new_puzzle[index], new_puzzle[index + 1] = new_puzzle[index + 1], new_puzzle[index]
            moves.append((new_puzzle, 2))  # Right move
        if index // 3 != 0:
            new_puzzle = puzzle[:]
            new_puzzle[index], new_puzzle[index - 3] = new_puzzle[index - 3], new_puzzle[index]
            moves.append((new_puzzle, 3))  # Up move
        if index // 3 != 2:
            new_puzzle = puzzle[:]
            new_puzzle[index], new_puzzle[index + 3] = new_puzzle[index + 3], new_puzzle[index]
            moves.append((new_puzzle, 4))  # Down move
        return moves

    def solve(self):
        root = Node(None, self.puzzle, None, None, 0)
        root.set_heuristic(self.goal)
        self.open_queue.append(root)

        while self.open_queue:
            curr_node = self.open_queue.popleft()
            self.closed_set.add(tuple(curr_node.puzzle))

            if curr_node.puzzle == self.goal:
                self.generate_solution(curr_node)
                return True

            for move, move_code in self.possible_moves(curr_node.puzzle):
                if tuple(move) not in self.closed_set:
                    child_node = Node(curr_node, move, move.index(0), move_code, curr_node.g + 1)
                    child_node.set_heuristic(self.goal)
                    self.open_queue.append(child_node)

            self.open_queue = deque(sorted(self.open_queue))

        return False

    def generate_solution(self, node):
        while node:
            self.solution_steps.append(node.puzzle)
            if node.move_code is not None:
                self.move_directions.append(node.move_code)
            node = node.parent
        self.solution_steps.reverse()
        self.move_directions.reverse()

    def get_solution_steps(self):
        return self.solution_steps

    def get_move_directions(self):
        return self.move_directions

# Example usage
initial_puzzle = [0, 8, 7, 4, 1, 3, 5, 2, 6]  # Example of an initial puzzle configuration

# Create an instance of the PuzzleAI with the initial puzzle configuration
puzzle_solver = PuzzleAI(initial_puzzle)

# Solve the puzzle
if puzzle_solver.solve():
    # Retrieve and print the solution steps
    solution_steps = puzzle_solver.get_solution_steps()
    move_directions = puzzle_solver.get_move_directions()
    print("Solution found! The steps to solve the puzzle are:")
    for i, step in enumerate(solution_steps):
        print(step)
    # Print the array of move directions
    print("Array of move directions:", move_directions)
else:
    print("No solution exists for the given puzzle.")

# DFS explicit stack implementation is faster to implement and much performant
# overall runtime is O(m+n)
# recursive implementation is 
# easiest to implement but slower
# it uses callstack which has a limit of 1000 frames in python

class Node:
  def __init__(self, value, left=None, right=None):
    self.value = value
    self.left = left
    self.right = right

  def __str__(self):
    return "Node(" + str(self.value) + ")"


def preorder_walk(tree):
  if tree is not None:
    print(tree)
    preorder_walk(tree.left)
    preorder_walk(tree.right)

def inorder_walk(tree):
  if tree is not None:
    inorder_walk(tree.left)
    print(tree)
    inorder_walk(tree.right)


def postorder_walk(tree):
  if tree is not None:
    postorder_walk(tree.left)
    postorder_walk(tree.right)
    print(tree)

mytree = Node('A', Node('B', Node('D'), Node('E')), Node('C', Node('F'), Node('G')))

print(inorder_walk(mytree))

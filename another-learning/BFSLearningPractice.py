from collections import deque

# A class to represent graph object
class Graph:
  #Constructor
    def __init__(self, edges, n):

      # a list of list to track adjacency(neighbours)
      self.adjList = [[] for _ in range(n)]

      # add edges to the undirectred graph
      for (src,dest) in edges:
        self.adjList[src].append(dest)
        self.adjList[dest].append(src)

# Perform BFS on graph recursively
def recursiveBFS(graph, q, discovered):

    if not q:
      return

    # deque front node and print it  
    v = q.popleft()
    print(v, end=' ')

    # do for every edge (v,u)
    for u in graph.adjList[v]:
      if not discovered[u]:
        # mark it as discovered
        discovered[u] = True

        # enque discovered vertex
        q.append(u)

    # restart BFS traversal from last discovered vertex    
    recursiveBFS(graph, q, discovered)    

if __name__ == "__main__":

  # List of graph edges
  edges = [(1,2), (1,3), (1,4), (2, 5), (2,6), (5,9),
    (5,10), (4,7), (4,8), (7,11), (7,12)]

  # total number of nodes in graph
  n = 15

  # build a graph from given edges
  graph = Graph(edges, n)

  # to keep track of whether a vertex is discovered or not
  discovered = [False] * n

  # create a queue for doing BFS
  q = deque()

  for i in range(n):
    if not discovered[i]:
      # mark source vertex as discovered 
      discovered[i] = True

      # enque source vertex as discovered
      q.append(i)

      # start BFS traversal from vertex i
      recursiveBFS(graph, q, discovered)

# Quicksort Algorithm
# O(n2) for worst case
# O(n* log(n)) for best and average case

def quicksort(arr, left, right):
  if left < right: # this checks that there are atleast two elements in array
    partition_pos = partition(arr, left, right) # returns index of pivot element
    quicksort(arr, left, partition_pos - 1) # call quicksort on all elements smaller than pivot
    quicksort(arr, partition_pos + 1, right) # call quicksort on all elements greater than pivot


def partition(arr, left, right): # calculate pivot element
  i = left
  j = right - 1
  pivot = arr[right]

  while i < j: # checks if i and j crossed each other
    while i < right and arr[i] < pivot: #checks if i is less than right and item at index i is less than pivot, so we increment i by 1
      i += 1
    while j > left and arr[j] >= pivot: # checks if j is greater than left and item at index j is greater than pivot, so we decrement j by 1
      j -= 1
    if i < j: # checks if i and crossed, if they didn't we swap
      arr[i], arr[j] = arr[j], arr[i]

  if arr[i] > pivot: #checks if i and j crossed, if they did we swap
    arr[i], arr[right] = arr[right], arr[i]

  return i #this helps quicksort function determine where to split the array to call quicksort recursively


arr = [22, 11, 88, 66, 55, 77, 33, 44]

quicksort(arr, 0, len(arr)-1)
print(arr)

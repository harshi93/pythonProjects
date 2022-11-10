def binary_search(arr, low, high, lookup_item):
  # check for base case
  if high >= low:
    mid = (high + low) // 2  #calculate absolute midpoint

    #if arr[mid] == lookup_item, then, return index of mid
    if arr[mid] == lookup_item:
      return mid
    # if arr[mid] > lookup_item, then lookup in right array
    elif arr[mid] > lookup_item:
      return binary_search(arr, low, mid - 1, lookup_item)
    else:
      #if arr[mid] < lookup_item then lookup in left array
      return binary_search(arr, mid + 1, high, lookup_item)
  else:
    return None


arr = [2, 3, 4, 10, 40]
x = 25

result = binary_search(arr, 0, len(arr) - 1, x)
print(result)

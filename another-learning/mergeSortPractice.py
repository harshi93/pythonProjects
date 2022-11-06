# Merge Sort
# O(n * log(n)) running time
# has optimal running time for comparison based algorithms

def merge_sort(arr):
    if len(arr) > 1: #do something only if lenght of array is greater than 1
        # Double / is used for intelligent addition and converts decimal values into next integer
        left_arr = arr[:len(arr)//2]  # split array from beginning to middle
        right_arr = arr[len(arr)//2:]  # split array from middle to end

        #Recursion
        merge_sort(left_arr)
        merge_sort(right_arr)

        #merge
        i = 0 #track index of left array
        j = 0 #track index of right array
        k = 0 #track index of merged array

        while i < len(left_arr) and j < len(right_arr):
            if left_arr[i] < right_arr[j]: #check if element at idx i in left_arr is smaller than element at idx j in right_arr, if so
                arr[k] = left_arr[i] # add element to merged array
                i += 1 #increment i by 1
            else: # check if element at idx j in right array is smaller than left array element at idx i, if so
                arr[k] = right_arr[j] # add element to merged array
                j += 1 #increment j by 1
            k += 1    #increment k by 1 

        while i < len(left_arr): #check if left array has elements that are missing from merged array
            arr[k] = left_arr[i] #add missing element from left array to kth index in merged array
            i += 1 #increment i by 1
            k += 1 # increment k by 1
 
        while j < len(right_arr): #check if right array has elements that are missing from merged array
            arr[k] = right_arr[j] # add missing element from right array to kth index in merged array
            j += 1 #increment j by 1
            k += 1 #increment k by 1


arr_test = [2,3,5,1,7,4,4,4,2,6,0]

merge_sort(arr_test)
print(arr_test)

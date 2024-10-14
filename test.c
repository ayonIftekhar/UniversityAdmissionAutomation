#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_N 50
#define MAX_DIGITS 10

// Custom comparison function for qsort
int compare(const void *a, const void *b) {
    char str1[MAX_DIGITS * 2];
    char str2[MAX_DIGITS * 2];

    snprintf(str1, sizeof(str1), "%d%d", *(const int *)a, *(const int *)b);
    snprintf(str2, sizeof(str2), "%d%d", *(const int *)b, *(const int *)a);

    return strcmp(str2, str1);
}

void generateLargestInteger(int n, int numbers[MAX_N]) {
    // Sort the integers in a way that maximizes the resulting integer
    qsort(numbers, n, sizeof(int), compare);

    // Concatenate and print the sorted integers
    for (int i = 0; i < n; i++) {
        printf("%d", numbers[i]);
    }
    printf("\n");
}

int main() {
    int n;
    scanf("%d", &n);

    while (n != 0) {
        int numbers[MAX_N];

        for (int i = 0; i < n; i++) {
            scanf("%d", &numbers[i]);
        }

        generateLargestInteger(n, numbers);

        scanf("%d", &n); // Read the next 'n'
    }

    return 0;
}

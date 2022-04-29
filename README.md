# Thaumcraft 4.x-5.x Research Helper
[Thaumcraft Research Helper](https://glowredman.github.io/tcresearch/)

## Using 
Choose  **`From`** and **`To`** Aspects from your research note and minimum number of steps between those aspects. Then click  **`Find Connection`** and the script will search for the shortest path 
(well, with at least the minimum length) that connects the two aspects.

## Note
Sometimes the length of any path is longer then the given minimum, but this should not be a problem for your research note.

## Disabling aspects
If your are unhappy with the path you got, because you do not have access to those aspects yet or they are quite rare, 
simply disable those aspects from Available Aspects:. The script will then try to find paths without these. Note that 
this may cause the path to grow longer. If too many aspects are disabled and there are no paths left without any of 
those, the script will try to find the shortest path using the minimal number of disabled aspects.

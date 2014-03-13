Thaumcraft 4.1 Research Helper
==========

[Link](http://ythri.github.io/tcresearch/)

This script helps you with your Thaumcraft 4.1 research. If you have a research note with two aspects that you don't 
know how to connect, simply choose them in the dropdown list above (From: and To:). Additionally, choose the minimum 
number of steps between those two aspects. If in your research note, the two aspects have two blank spaces between 
them, choose the value 2 for Min. Steps. Then click Find Connection and the script will search for the shortest path 
(well, with at least the minimum length) that connects the two aspects. Note that sometimes the length of any path is 
longer then the given minimum, but this should not be a problem for your research note.

If your are unhappy with the path you got, because you do not have access to those aspects yet or they are quite rare, 
simply disable those aspects from Available Aspects:. The script will then try to find paths without these. Note that 
this may cause the path to grow longer. If too many aspects are disabled and there are no paths left without any of 
those, the script will try to find the shortest path using the minimal number of disabled aspects.

News
----

March 13: Holidays, yay. If anything changes during the next weeks while I'm gone, for example Azanor updates to 
Thaumcraft 4.1.0h or 4.2 (you never know), feel free to fork this repository, add the changes, and post your fixed 
version on the ftb forums/reddit/etc. The combinations should be really easy to change (its just a JSON object), 
as should be adding or removing aspects (all of this only requires changes to the three variables `combinations`, 
`translate`, and `aspects`). See you soon.

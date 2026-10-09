/* 
Procedural cube landscape
    - Create a landscape made out of cube models that have been positioned in along a plane (such as the x-z plane) 
    in 3D space, in a grid.  Try a few different grid resolutions (how many cubes in x, how many cubes in z) and 
    make sure your performance is good.   (3D transform: translation) 

    - Create an algorithm to scale the cube models in the grid in the dimension orthogonal to the plane 
    (the y dimension, which is orthogonal to the x-z plane).  Initially you can use random numbers or a procedure 
    of your choice.  (3D transform: scaling)  

    - Assign the vertices of the cubes some initial colors, using a procedure you create.  Note how the fragment shader 
    interpolates color between the vertices. 

    - Create a camera path that updates, where the camera points towards to center of the landscape (such as 'look at 0,0,0'), 
    and rotates around this look at point.  
*/
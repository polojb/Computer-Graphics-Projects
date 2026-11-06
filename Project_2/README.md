# Project 2: Cube World - Design and Documentation

## Design

The project is a medieval mountain pass built entirely from scaled, translated, and rotated cubes. There are
also clouds and floating islands floating above the landscape. The only model that everything is built with 
is just a 2x2x2 cube drawn many times with different transformation matrices.

**Insperation**

The landscape is inspired by Lake Geneva in Switzerland, where moutains raise from the water, and medieval 
landscapes like those in Skyrim and similar games. 

**Sketch**



**Experiance**

- The camera orbits the landscape and always looks at its center, so the viewer sees the village from every 
side without any input.
- The ground is a grid of cube columns. Each column's height comes from a grayscale height map and its color
from a color map, so mountains rise and the lake sits lower.
- The sky layer sits above the terrain. Clouds drift across on curved paths and two sky islands, each with a
tree, bob up and down and slowly turn.
- The viewer can raise the image resolution from low to high, so the scene works on weaker laptops and looks
sharper on stronger ones.

**Design Choices**

- Faces get different brightness values (top brightest, bottom darkest) so the cubes read as solid shapes
without a lighting system
- Clouds and islands use cubes of different and varied sizes so they look different from the landscape, but
but all still come from the the shared cube object.
- Sky objects sit above the landscape with some clouds being able to touch the top of the moutains.

## Project Overview

Cube World is a WebGL application written in plain JavaScript, HTML and CSS with no graphics frameworks. 
It is hosted publicly on Vercel and deploys from the `main` branch.

| Item | Link |
| --- | --- |
| Live application | [computer-graphics-project-2.vercel.app](https://computer-graphics-project-2.vercel.app/) |
| Source code | [[Project 2 GitHub link](https://github.com/polojb/Computer-Graphics-Projects/tree/main/Project_2)] |

The code is split into one file per level:
 
- **Level 0:** page header and a single 2x2x2 cube.
- **Level 1:** procedural cube grid with scaled heights, vertex colors and an orbiting camera.
- **Level 2:** landscape driven by a color image and a height map image, with selectable resolution.
- **Level 3:** skyscape of clouds and floating islands moving on Bezier curves.
- **Level 4:** extra experiments. 

## Features and Controles



## How it Works



### The cube as vertices and triangles 



### Vertex colors and interpolation



### Transformation and the model matrix



### Objects built from several cubes



### Camera and projection



### Landscape from images (Level 2)



### Level 4 experiments



### Bezier curves in the skyscape



## Future Work



## AI Use

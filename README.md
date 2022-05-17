
## Network physical synchronization model room based on babylonjs + ammojs

<img src="screenshot.png?raw=true" />

The red mesh calculates the physical effects locally of the current user, and the green mesh calculates the physical effects on the clients of other players, and then synchronizes them through colyseus.

As for the player character, the sphere represents the player character, and the cube represents the interactive objects in the scene.

The first player to enter the scene is responsible for the physical calculation of the cube, and other players are responsible for receiving data and rendering. When other players collide with the cube, the physical calculation of the cube is transferred to the collided players. You can distinguish these changes by color, just like the difference between green and red mentioned above.

This is a very simple system. It will sacrifice some physical effects and has no server verification. However, you can still use it to achieve some recommended network physical collision effects.

be based on:
[https://github.com/endel/colyseus-babylonjs-boilerplate](https://github.com/endel/colyseus-babylonjs-boilerplate)

### Client application

To be able to build the client application, you'll need to enter in the folder,
and install its dependencies first.

```
npm install
```

Now you can build and run it by running:

```
npm start
```

It will spawn the `webpack-dev-server`, listening on [http://localhost:8080](http://localhost:8080).


### Server application

For the server, the steps are exactly the same. Install the dependencies:

```
cd babylonjs-multiplayer-boilerplate/server
npm install
```

Now you can build and run it by running:

```
npm start
```

It will spawn a web socket server, listening on [ws://localhost:2657](ws://localhost:2657).

## Documentation

- [BabylonJS documentation](https://doc.babylonjs.com/)
- [Colyseus documentation](https://docs.colyseus.io/)

## License

Apache License 2.0

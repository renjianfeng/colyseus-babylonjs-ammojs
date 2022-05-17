
## Network physical synchronization model room based on babylonjs + ammojs

<img src="screenshot.png?raw=true" />

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

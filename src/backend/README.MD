# The Stocks info api that everybody should have

The idea is to have a private API with all the stocks data you can need to do your investments and financial analysis with updated and clean data.

## Quick start

If you are in hurry, just run this commands:

`yarn install`

I always use yarn and I've found problems using npm and bun

`yarn start`

This will make the API start running in port 4000, now you only need
to start making requests to it to start adding stocks to be downloaded.

### What it does

It will have several services, one is providing the api, and other is updating the data with remote sources.

The data is stored in local files, so it will persist between runs.
It will also continue updating from the oldest data you have.
So you don't need to worry about restarts.

## Endpoints

- `/ticker/:id`: where :id es the ticker to be updated, for example `TSLA`. It returns all available ticker info.
- `/ticker/:id/:key`: where :key is the object key to be retrieved, for example `price` will find and return the first matching key from any of the providers if exists.

### Collaborate

Is an open project, so any help is welcome.

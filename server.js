'use strict';

const Hapi = require('@hapi/hapi');
const hapiGeoLocate = require("hapi-geo-locate");
const inert = require("@hapi/inert");
const path = require("path");

const init = async () => {
    const server = Hapi.Server({
        host: 'localhost',
        port: 1234,
        routes: {
            files: {
                relativeTo: path.join(__dirname, 'static')
            }
        }
    });

    await server.register([
        {
            plugin: hapiGeoLocate,
            options:{
                enabledByDefault: true
            }
        },
        {
            plugin: inert   //For static file response
        }
    ]);

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return h.file('welcome.html')
            },
            options:{
                files: {
                    relativeTo: path.join(__dirname, 'static')
                }
            }
        },
        {
            method: 'GET',
            path: '/download',
            handler: (request, h) => {
                return h.file('welcome.html', {
                    mode: 'attachment', //inline = display the file
                    filename: 'welcome-downloaded.html'
                })
            },            
        },
        {
            method: 'GET',
            path: '/location',
            handler: (request, h) => {
                if(request.location){
                    return request.location;
                }
                return "The enabledByDefault option was false"
            }
        },
        {
            method: 'GET',
            path: '/users/{user?}',
            handler: (request, h) => {
                //return h.redirect('/');
                if(request.query.firstname){
                    return `The firstname param has value of: ${request.query.firstname}`
                }
                else if(request.params.user){
                    return `Hello user ${request.params.user}`;
                }
                return 'Hello stranger';
            }
        },
        {
            method: 'GET',
            path: '/{any*}',
            handler: (request, h)=>{
                return "404";
            }
        }

    ]);    

    await server.start();

    console.log(`Server started on: ${server.info.uri}`);
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
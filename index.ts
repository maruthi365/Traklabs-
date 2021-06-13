import express from 'express';
var bodyParser = require('body-parser')

var cors = require('cors');
const app = express();
app.use(cors())
var amqp = require('amqplib/callback_api');
var jsonParser = bodyParser.json()
app.get('/getEmp', (req, res) => {
    console.log("triggerd")
    amqp.connect('amqp://localhost', function(error0:any, connection:any) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1:any, channel:any) {
        if (error1) {
            throw error1;
        }

        var queue = 'getRecord';
        var msg = "push";

        channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(msg));
        channel.consume(queue, function(msg:any) {
            console.log("/GET/", msg.content.toString());
            res.send(msg.content.toString());
        }, {
            noAck: true
        });
    });
    
});
   
})
app.post('/setEmp' ,jsonParser, (req, res) => {
    amqp.connect('amqp://localhost', function(error0:any, connection:any) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1:any, channel:any) {
        if (error1) {
            throw error1;
        }
        var queue = 'setRecord';
        var msg = JSON.stringify(req.body);

        channel.assertQueue(queue, {
            durable: false
        });
        channel.consume(queue, function(msg:any) {
            console.log("/POST/");
            if(Number(msg.content.toString())>0)
            res.end("Success");
            else
            res.status(500).end('Something broke!');
        }, {
            noAck: true
        });
        channel.sendToQueue(queue, Buffer.from(msg));
       
    });
    
});
   
})
app.put('/setEmp' ,jsonParser, (req, res) => {
    amqp.connect('amqp://localhost', function(error0:any, connection:any) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1:any, channel:any) {
        if (error1) {
            throw error1;
        }
        var queue = 'putRecord';
        var msg = JSON.stringify(req.body);

        channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(msg));
        channel.consume(queue, function(msg:any) {
            console.log("/PUT/");
            if(Number(msg.content.toString())>0)
            res.end("Success");
            else
            res.status(500).end('Something broke!');
        }, {
            noAck: true
        });
    });
    
});
   
})

app.listen(3000, () => {
    console.log('The application is listening on port 3000!');
})
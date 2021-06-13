"use strict";
var amqp = require('amqplib/callback_api');
var _a = require('pg'), Pool = _a.Pool, Client = _a.Client;
var connectionString = 'postgresql://postgres:1234@localhost:5432/test';
amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'getRecord';
        channel.assertQueue(queue, {
            durable: false
        });
        console.log("Listening on Channel", queue);
        channel.consume(queue, function (msg) {
            console.log("/GET/", msg.content.toString());
            var pool = new Pool({
                connectionString: connectionString,
            });
            pool.query('select * from emp', function (err, res) {
                if (err) {
                    console.log("err");
                    console.log(err);
                }
                console.log(res.rows);
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(res.rows)));
                pool.end();
            });
        }, {
            noAck: true
        });
    });
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'setRecord';
        channel.assertQueue(queue, {
            durable: false
        });
        console.log("Listening on Channel", queue);
        channel.consume(queue, function (msg) {
            if (JSON.parse(msg.content.toString()) != 1) {
                var data = JSON.parse(msg.content.toString());
                console.log("/POST/", JSON.parse(msg.content.toString()));
                var pool_1 = new Pool({
                    connectionString: connectionString,
                });
                console.log("insert into emp(name,dept) values('" + data.name + "','" + data.dept + "')");
                pool_1.query("insert into emp(name,dept) values('" + data.name + "','" + data.dept + "')", function (err, res) {
                    if (err) {
                        console.log("err");
                        console.log(err);
                    }
                    console.log(res);
                    channel.sendToQueue(queue, Buffer.from(JSON.stringify(res.rowCount)));
                    pool_1.end();
                });
            }
        }, {
            noAck: true
        });
    });
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'putRecord';
        channel.assertQueue(queue, {
            durable: false
        });
        console.log("Listening on Channel", queue);
        channel.consume(queue, function (msg) {
            var data = JSON.parse(msg.content.toString());
            console.log("/PUT/", JSON.parse(msg.content.toString()));
            var pool = new Pool({
                connectionString: connectionString,
            });
            console.log("update emp set name='" + data.name + "',dept='" + data.dept + "' where id=" + data.id);
            pool.query("update emp set name='" + data.name + "',dept='" + data.dept + "' where id=" + data.id, function (err, res) {
                if (err) {
                    console.log("err");
                    console.log(err);
                }
                console.log(res);
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(res.rowCount)));
                pool.end();
            });
        }, {
            noAck: true
        });
    });
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'deleteRecord';
        channel.assertQueue(queue, {
            durable: false
        });
        console.log("Listening on Channel", queue);
        channel.consume(queue, function (msg) {
            console.log("/DELETE/", msg.content.toString());
        }, {
            noAck: true
        });
    });
});

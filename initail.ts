var amqp = require('amqplib/callback_api');
const { Pool, Client } = require('pg')
const connectionString = 'postgresql://postgres:1234@localhost:5432/test'



amqp.connect('amqp://localhost', function(error0:any, connection:any) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1:any, channel:any) {
        if (error1) {
            throw error1;
        }
        
        var queue = 'getRecord';

        channel.assertQueue(queue, {
            durable: false
        });
        console.log("Listening on Channel",queue)

        channel.consume(queue, function(msg:any) {
            console.log("/GET/", msg.content.toString());
            const pool = new Pool({
                connectionString,
              })
            pool.query('select * from emp', (err:any, res:any) => {
                if(err){
                    console.log("err")
                    console.log(err)
                }
              console.log(res.rows)
              channel.sendToQueue(queue, Buffer.from(JSON.stringify(res.rows)));
              pool.end()
            })
        }, {
            noAck: true
        });
    });
    connection.createChannel(function(error1:any, channel:any) {
        if (error1) {
            throw error1;
        }

        var queue = 'setRecord';
        
        channel.assertQueue(queue, {
            durable: false
        });
        console.log("Listening on Channel",queue)

        channel.consume(queue, function(msg:any) {
            if(JSON.parse(msg.content.toString())!=1){
            var data=JSON.parse(msg.content.toString());
            console.log("/POST/", JSON.parse(msg.content.toString()));
            const pool = new Pool({
                connectionString,
              })
              console.log("insert into emp(name,dept) values('"+data.name+"','"+data.dept+"')")
            pool.query("insert into emp(name,dept) values('"+data.name+"','"+data.dept+"')", (err:any, res:any) => {
                if(err){
                    console.log("err")
                    console.log(err)
                }
              console.log(res)
              channel.sendToQueue(queue, Buffer.from(JSON.stringify(res.rowCount)));
              pool.end()
            })}
        }, {
            noAck: true
        });
    });
    connection.createChannel(function(error1:any, channel:any) {
        if (error1) {
            throw error1;
        }

        var queue = 'putRecord';

        channel.assertQueue(queue, {
            durable: false
        });
        console.log("Listening on Channel",queue)

        channel.consume(queue, function(msg:any) {
            var data=JSON.parse(msg.content.toString());
            console.log("/PUT/", JSON.parse(msg.content.toString()));
            const pool = new Pool({
                connectionString,
              })
              console.log("update emp set name='"+data.name+"',dept='"+data.dept+"' where id="+data.id)
              pool.query("update emp set name='"+data.name+"',dept='"+data.dept+"' where id="+data.id, (err:any, res:any)    => {
                if(err){
                    console.log("err")
                    console.log(err)
                }
              console.log(res)
              channel.sendToQueue(queue, Buffer.from(JSON.stringify(res.rowCount)));
              pool.end()
            })
        }, {
            noAck: true
        });
    });
    connection.createChannel(function(error1:any, channel:any) {
        if (error1) {
            throw error1;
        }

        var queue = 'deleteRecord';

        channel.assertQueue(queue, {
            durable: false
        });
        console.log("Listening on Channel",queue)

        channel.consume(queue, function(msg:any) {
            console.log("/DELETE/", msg.content.toString());
        }, {
            noAck: true
        });
    });
});

const path = require("node:path");
const fs = require("node:fs")
const http = require("node:http");


// ################## Part 1 ################


// ################## Q1 ################
const bigPath = path.resolve("./big.text")
const readStream = fs.createReadStream(bigPath, { encoding: "utf-8" })

readStream.on("data", (chunk) => {
    console.log(chunk);
})

// ################## Q2 ################
const copyPath = path.resolve("./copy.text")
const writeStream = fs.createWriteStream(copyPath, { encoding: "utf-8" })

readStream.on("data", (chunk) => {
    writeStream.write(chunk)
})

// ################## Q3 ################
const Zip = require("node:zlib")
readStream.pipe(Zip.createGzip()).pipe(writeStream)



// ############### Part 2 ###################

const userspath = path.resolve("./users.json")
const readable = fs.readFileSync(userspath, { encoding: "utf-8" })
let port = 3000;
const users = JSON.parse(readable)



const server = http.createServer((req, res) => {
    const { url, method } = req;

    if (url == "/home" && method == "GET") {
        res.writeHead(200);
        res.write("hi \nYou are in Home Page ");
        res.end();
    }

    else if (url == "/sign" && method == "POST") {
        let data = "";

        req.on("data", (chunk) => {
            data += chunk;
        })

        req.on("end", () => {
            data = JSON.parse(data)
            const { name } = data
            const existUser = users.find((value) => {
                return name === value.name
            })

            if (existUser) {
                res.writeHead(409, { "content-type": "text/plain" });
                res.write("This email already exist");
                return res.end();

            }

            users.push(data);
            fs.writeFileSync(userspath, JSON.stringify(users))

            res.writeHead(201, { "content-type": "application/json" });
            res.write(JSON.stringify(users));
            res.end();
        })
    }

    else if (url.includes("/update") && method == "PATCH") {
        let data = "";

        req.on("data", (chunk) => {
            data += chunk
        })

        req.on("end", () => {
            data = JSON.parse(data)
            const { password, name } = data

            const id = url.split("/")[2]

            const user = users.find((value) => {
                return value.id == id
            })


            if (!user) {
                res.writeHead(409, { "content-type": "text/plain" });
                res.write("The User not found");
                return res.end()
            }
            user.password = password;
            user.name = name;

            fs.writeFileSync(userspath, JSON.stringify(users))
            res.writeHead(200, { "content-type": "text/plain" });
            res.write("Updated");
            res.end();



        })
    }

    else if (url.includes("/delete") && method == "DELETE") {
        const id = url.split("/")[2];

        const userINdex = users.findIndex((ele) => {
            return ele.id == id;
        })

        if (userINdex == -1) {
            res.writeHead(409, { "content-type": "text/plain" });
            res.write("There is no user with this id");
            return res.end();
        }

        users.splice(userINdex, 1)

        fs.writeFileSync(userspath, JSON.stringify(users))
        res.writeHead(200, { "content-type": "text/plain" });
        res.write("Deleted");
        res.end();


    }

    else if (url.includes("/getUSerData") && method == "GET") {
        const id = url.split("/")[2]

        const userINdex = users.findIndex((value) => {
            return value.id == id
        })

        if (userINdex == -1) {
            res.writeHead(409, { "content-type": "text/plain" });
            res.write("There is no user with this id");
            return res.end();
        }

        const user = users[userINdex]
        res.writeHead(200, { "content-type": "application/json" });
        res.write(JSON.stringify(user));
        res.end();

    }

    else if (url == "/getAllUser", method == "GET") {
        res.writeHead(200, { "content-type": "application/json" });
        res.write(JSON.stringify(users));
        res.end();
    }

    else {
        res.writeHead(404)
        res.write("Invalid Url")
        res.end();

    }

    req.on("error", (err) => {
        console.log(err.message, err.stack);

    })
})


server.listen(port, () => {
    console.log(`Server is running on port :: ${port}`);
})


// #################### Part 3 ###################

/*
1) The Node.js Event Loop is a mechanism that allows Node js to handle multiple asynchronous operations efficiently using a single thread It continuously checks the call stack and the task queues, executing callbacks when the stack is empty, which enables non-blocking I/O operations.

2) Libuv is a C library that provides Node.js with asynchronous I/O capabilities. It manages the event loop, handles non-blocking operations and uses a thread pool to execute tasks like file system operations and networking efficiently

3) Node.js delegates asynchronous tasks to Libuv or the system, and once they are completed their callbacks are placed in the event loop to be executed without blocking the main thread

4) The Call Stack executes synchronous code

   The Event Queue holds completed asynchronous callbacks

   The Event Loop moves callbacks from the queue to the stack when it becomes empty

5) The Node.js thread pool is used to handle heavy or blocking tasks like file system and crypto operations. Its size can be configured using the UV_THREADPOOL_SIZE environment variable

6) Blocking code stops the execution of other tasks, while non-blocking code allows Node.js to continue running other operations using asynchronous processing and the event loop
 */
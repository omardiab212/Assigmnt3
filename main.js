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

readStream.on("data" , (chunk)=>{
    writeStream.write(chunk)
})

// ################## Q3 ################
const Zip = require("node:zlib")
readStream.pipe(Zip.createGzip()).pipe(writeStream)



const userspath = path.resolve("./users.json")
const readable = fs.readFileSync(userspath, { encoding: "utf-8" })
let port = 3000;
const users = JSON.parse(readable)


// ############### Part 2 ###################
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


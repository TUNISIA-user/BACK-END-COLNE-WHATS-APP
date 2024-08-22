//importing 
 
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from "cors"

//app config 
const app = express()
 
const PORT = 5000


const db = mongoose.connection;

db.once('open',()=>{
  // @ app founder nahdi ghait 
    const msgCollection  = db.collection("messagecontents")
   
    const changeStream  = msgCollection.watch()
   
    changeStream.on("change",(change)=>{
      console.log("A Cahnge occured",change)
      
      if(change.operationType=="insert"){
        const messageDeatils  = change.fullDocument;
        console.log(messageDeatils,"messag recevied")
        pusher.trigger("messsages","inserted",{
          name : messageDeatils.name ,
          message : messageDeatils.message ,
          timestamp : messageDeatils.timestamp,
          received : messageDeatils.received
         
        })
      }else{
        console.log("Eroro triggering Pusher")
      }


    })
})

const pusher = new Pusher({
    appId: "1848393",
    key: "63ee1225bb81547a684d",
    secret: "8ec90e46a0129b3a49fd",
    cluster: "eu",
    useTLS: true,
  });













// midlleware 
app.use(express.json())
app.use(cors())
app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin",'*')
  res.setHeader("Access-Control-Allow-Headers",'*')
  next()
})





app.get("/",(req,res)=>res.status(200).send("hello world"))

app.get("/message/sync", async (req, res) => {
    try {
      const data = await Messages.find();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  





//api routes

 
app.post('/messages/new', (req, res) => {
    const dbMessage = req.body;
    Messages.create(dbMessage)
        .then(message => res.status(201).send(`New message created: \n ${message}`))
        .catch(err => res.status(500).send(err));
});


// delte function 
app.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the message exists
      const author = await Messages.findById(id);
      
      if (author) {
        // Delete the message
        await Messages.findByIdAndDelete(id);
        res.status(200).json({ message: "Message has been deleted" });
      } else {
        res.status(404).json({ message: "Message not found" });
      }
    } catch (error) {
      console.error(`Error: ${error.message}`); // Use error.message for clarity
      res.status(500).json({ message: "Internal server error" });
    }
  });
  


// DB config 
const URL = "mongodb+srv://admin:N7DEHE93DUKDZ@cluster0.zhmtr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(URL)
    .then(() => console.log('MONGODB connected .... '))
    .catch(err => console.error('MongoDB connection error:', err));

//listen 
 
app.listen(PORT,()=>console.log(`Listening on localhost ${PORT}`))

//middleaware 

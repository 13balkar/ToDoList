//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));





mongoose.connect("mongodb+srv://admin_balkar:todo_cluster@cluster0.cthop.mongodb.net/todoDb", {
  useNewUrlParser: true
});
const itemSchema = {
  name: {
    type: String,
    // required: [true, "Namm ta pa deo paji."]
  }
};
const Item = mongoose.model("item", itemSchema);
const a = new Item({
  name: "Buy Food"
});
const b = new Item({
  name: "Cook Food"
});
const c = new Item({
  name: "Eat Food"
});
const defaultItems = [a, b, c];
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  // const day = date.getDate();
  Item.find({}, function(err, it) {
    if (it.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log("error");
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");
    } else {
      it.forEach(function(ele) {
        console.log(ele.name);
      })
      res.render("list", {
        listTitle: "Today",
        newListItems: it
      });
    }
  });

});
app.get("/:customListName", function(req, res) {
  const customL = _.capitalize(req.params.customListName);
  List.findOne({
    name: customL
  }, function(err, found) {
    if (!err) {
      if (!found) {
        const lis = new List({
          name: customL,
          items: defaultItems
        });
        lis.save();
        res.redirect("/" + customL);
      } else {
        res.render("list", {
          listTitle: customL,
          newListItems: found.items
        });
      }
    }
  });

});


app.post("/", function(req, res) {

  const item = req.body.newItem;
  const listName = req.body.list;
  if (item !== "") {
    const x = new Item({
      name: item
    });
    if (listName === "Today") {
      x.save();
      res.redirect("/");
    } else {
      List.findOne({
        name: listName
      }, function(err, found) {
        if (!err) {
          found.items.push(x);
          found.save();
          res.redirect("/" + listName);
        } else {
          console.log(err);
        }
      });
    }
  } else {
    if (listName === "Today") {
      res.redirect("/");
    } else {
      res.redirect("/" + listName);
    }
  }

});

app.post("/delete", function(req, res) {
  const check = req.body.delcheck;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.deleteOne({
      _id: check
    }, function(err) {
      console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName
    }, { $pull: {items:{_id:check}}}, function(err, rest) {
      if(!err){
          res.redirect("/" + listName);
      }
    });

  }

});



app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});

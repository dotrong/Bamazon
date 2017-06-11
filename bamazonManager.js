var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'Bamazon'
});

connection.connect(function(error) {
    if (error) throw error;
    showMenu(); 
});

 function showMenu() {

     inquirer.prompt([{

        name: "option",
        type: "list",
        message:"Please select following options",
        choices:["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product","Exit application"] 
    }
    ]).then(function(questions) {

        switch(questions.option) {
            case "View Products for Sale":
                viewProduct();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add to Inventory":
                addToInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Exit application":
                connection.end();
                break;

        }
    
    });

 }

var viewProduct = function() {

    var listQuery = "SELECT item_id,product_name,price,stock_quantity from products";
    connection.query(listQuery, function (error, results, fields) {
         
        if (error) throw error;

        displayItem(results);

        showMenu();
          
    });

};

var viewLowInventory = function() {

    var listQuery = "SELECT item_id,product_name,price,stock_quantity from products WHERE stock_quantity < 5";
    connection.query(listQuery, function (error, results, fields) {
         
        if (error) throw error;

        displayItem(results);

        showMenu();
          
    });


};

var addToInventory = function() {

    inquirer.prompt([{
        name:"id",
        type:"input",
        message:"? Which product id you would like to add more items ?"

    },
    {
        name:"count",
        type:"input",
        message: "?How many items you would like to add ?"
    }
    
    ]).then(function(results) {
        var id = results.id;
        var count = results.count;

        var listQuery = "SELECT stock_quantity from products WHERE ?";

        connection.query(listQuery,{item_id:id}, function (error, results, fields) {
            //no item in database
            if (results.length == 0) {
                console.log("We don't have that product id in inventory!");
                showMenu();
            }
            else {

                var stock_quantity = parseFloat(results[0].stock_quantity);
               // console.log(results[0].stock_quantity);
                var new_quantity = stock_quantity + parseFloat(count);
                   // console.log(new_quantity);
                var updateQuery = "UPDATE products SET ? WHERE ?";

                connection.query(updateQuery,[{stock_quantity:new_quantity},{item_id:id}], 
                    function (error, results, fields) {
                        console.log(count + " added successfully to inventory\n");
                        showMenu();
                    });
                }
            
            });

    });

};


var addNewProduct = function() {

    inquirer.prompt([{
        name:"product_name",
        type:"input",
        message:"? The name of product you would like to add ?"

    },
    {
        name:"department_name",
        type:"input",
        message: "? The name of department of this product ?"
    },

     {
        name:"price",
        type:"input",
        message: "? Product price ?"
    },

    {
        name:"stock_quantity",
        type:"input",
        message: "? How many items you would like to add for this new product ?"
    }
    
    ]).then(function(results) {
        var product_name = results.product_name;
        var department_name = results.department_name;
        var price = results.price;
        var stock_quantity = results.stock_quantity;

        var insertQuery = "INSERT into products SET ?";

        connection.query(insertQuery,{product_name:product_name,department_name:department_name,
            price:price,stock_quantity:stock_quantity},function (error, results, fields) {
            
                console.log("Item added successfully to inventory\n");
                showMenu();

            });

    });

};


var displayItem = function(list) {

    console.log("\nItem in our Store");
    console.log("----------------------------------------------");
    console.log("Product_ID | \t\tProduct_Name | \t\tPrice | \t\tStock_Quantity");

    for (var i = 0;i<list.length;i++) {

        console.log(list[i].item_id + "\t | \t" + list[i].product_name + " | \t" + 
        list[i].price+ "\t | \t"+list[i].stock_quantity + "\n");
    }
}


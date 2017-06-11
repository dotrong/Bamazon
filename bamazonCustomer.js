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
    showItem(); 
});

 function showItem() {

    var listQuery = "SELECT item_id,product_name,price from products";
    connection.query(listQuery, function (error, results, fields) {
         
        if (error) throw error;

        displayItem(results);

        queryUser();
          
    });

}

var queryUser = function() {

    inquirer.prompt([{

        name: "id",
        type: "input",
        message: "? What is the id of product you want to buy?"

    },
    {
        name: "numberOfItem",
        type: "input",
        message: "? How many units of product you want to buy?"

    }
    ]).then(function(questions) {
        
        var listQuery = "SELECT stock_quantity,price,prod.department_name,product_sales,dep.total_sales from products prod"+
        " INNER JOIN departments dep "+
        
        "ON dep.department_name = prod.department_name WHERE ?";
        //console.log(listQuery);

        connection.query(listQuery,{item_id:questions.id}, function (error, results, fields) {
            //console.log(results);
            //no item in database
            if (results.length == 0) {
                console.log("We don't have that product id in inventory!");
                connection.end();
            }
            else {

                var stock_quantity = results[0].stock_quantity;
                var price = results[0].price;
                var department_name = results[0].department_name;
                var product_sales = results[0].product_sales;
                var total_sales = results[0].total_sales;

               // console.log(results[0].stock_quantity);
                if (stock_quantity >= questions.numberOfItem) {

                    var new_quantity = stock_quantity - questions.numberOfItem;
                    var new_product_sales = product_sales + price*questions.numberOfItem;
                    var new_total_sales = total_sales + new_product_sales;
                   // update stock quantity and product sales in product table
                    var updateQuery = "UPDATE products SET ?,? WHERE ?";

                    connection.query(updateQuery,[{stock_quantity:new_quantity},{product_sales:new_product_sales},
                    {item_id:questions.id}], function (error, results, fields) {
                        //connection.end();
                    });

                    //update total sales in departments table

                    var updateQuery = "UPDATE departments SET ? WHERE ?";

                    connection.query(updateQuery,[{total_sales:new_total_sales},{department_name:department_name},], 
                    function (error, results, fields) {
                        console.log(questions.numberOfItem + "items are sold!");
                        connection.end();
                    });
            }
                else {
                    console.log("Sorry we only have " + stock_quantity + ". Please comeback later");
                    connection.end();
                }

            }
           
        });
 
    });

};

var displayItem = function(list) {

    console.log("Available item in our Store");
    console.log("----------------------------------------------");
    console.log("Product_ID | \t\tProduct_Name | \t\tPrice");

    for (var i = 0;i<list.length;i++) {

        console.log(list[i].item_id + "\t | \t" + list[i].product_name + " | \t" + 
        list[i].price+"\n");
    }
}
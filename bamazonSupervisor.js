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
        choices:["Product Sales by Department","Create New Department","Exit application"] 
    }
    ]).then(function(questions) {

        switch(questions.option) {
            case "Product Sales by Department":
                saleByDept();
                break;
            case "Create New Department":
                createDept();
                break;
            
            case "Exit application":
                connection.end();
                break;

        }
    
    });

 }

var saleByDept = function() {

    var listQuery = "SELECT department_id,department_name,over_head_costs,total_sales" + 
    ",total_sales-over_head_costs as total_profit from departments" ;

    connection.query(listQuery, function (error, results, fields) {
         
        if (error) throw error;

        displayItem(results);

        showMenu();
          
    });

};


var createDept = function() {

    inquirer.prompt([{
        name:"department_name",
        type:"input",
        message:"? The name of department you would like to add ?"

    },
    {
        name:"over_head_costs",
        type:"input",
        message: "? Over head costs of this department ?"
    }
  
    ]).then(function(results) {
        var department_name = results.department_name;
        var over_head_costs = results.over_head_costs;
        var total_sales = 0;

        var insertQuery = "INSERT into departments SET ?";

        connection.query(insertQuery,{over_head_costs:over_head_costs,department_name:department_name,
            total_sales:total_sales},function (error, results, fields) {
            
                console.log("Department added successfully to inventory\n");
                showMenu();

            });

    });

};


var displayItem = function(list) {

    console.log("\nSales by Department in our Store\n");
    console.log("----------------------------------------------");
    console.log("Department_ID | Department_Name | Over_Head_Costs | Total_Sales | Total_Profit");

    for (var i = 0;i<list.length;i++) {

        console.log(list[i].department_id + "\t | \t" + list[i].department_name + " | \t" + 
        list[i].over_head_costs+ "\t | \t"+list[i].total_sales + "\t | \t"+list[i].total_profit +"\n");
    }
}


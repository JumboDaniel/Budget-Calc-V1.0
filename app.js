
///////Budget Controller
    var budgetController= (function(){
    var Expense =function(id, description, value){ 
        this.id= id;
        this.description= description;
        this.value= value;
        this.percentage= -1; 
    };

    Expense.prototype.calcPercentage= function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage= function () {
        return this.percentage; 
    };

    var Income =function(id, description, value){ 
        this.id= id;
        this.description= description;
        this.value= value;
    };

    var calculateTotal= function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type]= sum;
    }
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp:[],
            inc: []
        },
        budget: 0,
        percentage:-1
    };

    return{
        addItem: function(type, des, val){
            var newItem, ID;
            //create new id
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //create new item based on inc or exp type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            //push it to our data structure
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            
            // id = 6
            //data.allItems[type][id];
            // ids = [1 2 4  8]
            //index = 3
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            
            index =  ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function() {
            //1.Calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc'); 

            //2. Calculate total budget= income - expense
            data.budget= data.totals.inc - data.totals.exp;

            //3. Calculate the percentage 
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }            
              
        },
        calculatePercentage: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc= data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function(){
            console.log(data);
        }        
    };
    })();


///////UI Controller
    var UIcontroller = (function(){

        var DOMstrings = {
            inputType: '.add__type',
            inputDescription:'.add__description',
            inputValue: '.add__value',
            inputBtn: '.add__btn',
            incomeContainer: '.income__list',
            expensesContainer: '.expenses__list',
            budgetLabel:'.budget__value',
            incomeLabel:'.budget__income--value',
            expensesLabel:'.budget__expenses--value',
            percentageLabel:'.budget__expenses--percentage',
            container: '.container',
            dateLabel: '.budget__title--month'
        };

        var formatNumber = function(num, type) {
            var numSplit, int, dec, type;
            /*
                + or - before number
                exactly 2 decimal points
                comma separating the thousands
    
                2310.4567 -> + 2,310.46
                2000 -> + 2,000.00
                */
    
            num = Math.abs(num);
            num = num.toFixed(2);
    
            numSplit = num.split('.');
    
            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
            }
    
            dec = numSplit[1];
    
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    
        };

        return{
            getInput: function(){
                return{
                    type: document.querySelector(DOMstrings.inputType).value,//  will be either income or expenses
                    description: document.querySelector(DOMstrings.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                };
            },

            //add a list item
            addListitem: function(obj,type) {
                var html, newHtml, element;
                // Create HTMl string with place holder text
                if (type === 'inc') {
                    element = DOMstrings.incomeContainer;
                    
                    html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                } else if (type === 'exp') {
                    element = DOMstrings.expensesContainer;
                    
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
                
                // Replace the placeholder with some actual data
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
                             
                //  Insert the HTML to the DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
                       
            },
            deleteListItem: function (selectorID) {              
              var el = document.getElementById(selectorID);
              el.parentNode.removeChild(el); 
            },
            clearField: function(){
                var fields, fieldsArr;
                
                fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

                fieldsArr = Array.prototype.slice.call(fields);

                fieldsArr.forEach(function(current, index, array){
                    current.value = "";
                });
                fieldsArr[0].focus();
            },

            displayBudget: function(obj) {
                var type;
                type = obj.budget > 0 ? type = 'inc' : type = 'exp';
                
                document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
                document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
                document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
                
                if (obj.percentage > 0) {
                    document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
                } else {
                    document.querySelector(DOMstrings.percentageLabel).textContent = '---';
                }
                
                
            },

            displayMonth: function() {
                var now, months, month, year;
                
                now = new Date();
                //var christmas = new Date(2016, 11, 25);
                
                months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                month = now.getMonth();
                
                year = now.getFullYear();
                document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            },
            
            getDOMstrings: function(){
               return DOMstrings;
            }
        };

    })();

////Global App Controller
    var controller = (function(budgetCtrl, UICtrl){
        
        var setupEventlisteners= function(){
        
        var DOM = UICtrl.getDOMstrings();
            ///onclcick of the button  
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        
        ///on click of the enter key
        document.addEventListener('keypress', function(event){
                if(event.keyCode === 13 || event.which === 13){
                    ctrlAddItem();
                }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        }
        var updateBudget= function(){
            //1. Calculate the budget 
            budgetCtrl.calculateBudget();

            //2. Return the budget 
            var budget= budgetCtrl.getBudget();
            
            //3. Return the budget to the UI
            UICtrl.displayBudget(budget);
            console.log(budget);
        };
        var updatePercentages= function () {
            //1. Calculate percentages
            budgetCtrl.calculatePercentage();
            //2. Read percentages from the budget controller
            var percentages = budgetCtrl.getPercentages();
            console.log(percentages);
            //3. Update the UI with the new percentages
        };
        var ctrlAddItem = function(){     
            var input, newItem;    

            //1. Get Input data as soon as the user clicks
            input= UICtrl.getInput();
            console.table(input);
            
            //If all this parameter are not met the application will not run
            if(input.description != ""  && !isNaN(input.value) && input.value > 0){
           
            //2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. add the new item to the user interface (UI)
            UICtrl.addListitem(newItem, input.type);

            //4.Clear the fields
            UICtrl.clearField();

            //5. Calculating and updating the budget
            updateBudget();

            //6. Calculate and update percentage
            updatePercentages();
            } 
            else{
                window.alert('Please Input the right data')
            };
            
          
          };
          var ctrlDeleteItem = function(event){
           var itemID, splitID, type, ID;
           var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
           if (itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete item from the data structure 
            budgetCtrl.deleteItem(type, ID);

            //2. delete item form the UI
            UICtrl.deleteListItem(itemID);

            //3. Update the new budget and show it
            updateBudget(); 

            //4. Calculate and update percentage
            updatePercentages();
           }
          }; 
          return{
              init:function(){
                  console.log('Application has started');
                  UICtrl.displayMonth();
                UICtrl.displayBudget({
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                });
                  setupEventlisteners();
              }
          };

    })(budgetController, UIcontroller);
    
    controller.init();
    budgetController.testing();
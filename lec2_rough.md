#LECTURE 2 

##first class functions


var x = function square(a){return a*a}

x ; gives you the definition of x

x(100) o/p=10000

var mySum=function(a,b){return a+b}
mySum(100,50)
mySum(100,50,200) o/p=150 200 will not be counted however

if we want the 200, then we redefine the function
mySum=function(a,b){return a+b+c}


#3 types of fucntions we care about:

1) function declaration
        var mySum=function(a,b){return a+b}

        -the keyword here is "function" in the begininning of us making this
        -values can be passed in the function or outside doesnt matter
        -availaible anywhere inside the file



2) function expression

        const mySum= function sum(a,b)
        {return a +b};

        mySum(5,6);

        the declaration of sum could be used incases of recursive functions
        second name is a good habit to have to add to functions

        mySum(3,3) would only work after the fucntion is define not before 

    


( function (a,b){return a+b}) is a fucntion expression since first word is ( which is enough to have this as function expression


do not need to be assigned to variables , can be assigned to properties 



3) arrow functions


        less common
        const mySum=(a,b) => a+b;

        no return keyword but is implied to rrtuen a+b


        const sq= x=> x*x;
            //explain this in detail

        const zero=()=>0 //no paramaneter at all
            //explain

        [1,2,3].map(sq) 

        [1,2,3].map(zero)#returns [0,0,0]


4) multiline arrow funcs


    const sumofSquares=(a,b)=>{
        let aa=sq(a)
        let bb=sq(b)
        return mySum(aa,bb)

        //explain in detail
        can i have if statements in here?
        what benefits we loose from using these?
    }



// exaomples

//given integen IMPID

//create an employyee record {employee_id:IMPID}

//eg.

//input:3

//output:{employee_id:3}


function employeeID(IMPID){

    return { employee_id: IMPID };

}

now w arrow

To return an object, you need to wrap it in parentheses:
const create_employee = IMPID => ({ employee_ID: IMPID });

Rule of thumb:
({ ... }) → returns an object literal.
{ ... } → treated as a block of code.


arrow functions dont have a this

const myFrac={num:3- den:4, toDecimal:function(){return this.num/this.den}}

now, 

const myFrac2={num:3- den:4, toDecimal()=> this.num/this.den} //explain how passing values outside would make it work




//deconstructing assignment

let download={a:5,b:7,c:5,d:"str",e:10}
let {a,c,e}=download //explain what it does

freedictionaryapi 




//spread and rest operators

//spread- converts from array to parameter list


Math.max(5,4)

now
const download=[5,0,100,40505,405,320]

how to find largest number in here

now math.max cant work on download since the data type of download is array 

Math.max(...download); //explain what happens here



let a=[1,2,3]
let b=[7,8,9]

let c=[...a,4,5,6,...b];
//o/p=

also works for objects

let download={a:5,b:7,c:5,d:"str",e:10}

now we want to add f

let f="perf"

{...download,f} or

{...download,f:f} //edxplain this esp what f:f mean 




//rest op

// converts from paramater list to array 
        only used in functions definitions in paramter list

        Math.max(2,3,4,5,5,4,3,4,3,43,4,3,4,34,3)

        function myMax(...nums) we need n number of paramter hence we use rest operator

        the context btw rest and spread matter even though symbol is same


        if used in paramater in function definition THEN AND ONLY THEN ITS A REST OPERATOR


        function mySum(...nums){

            for ()
        }




#TOPIC 2

stacks and heaps

STACKS
//WHAT CAN BE STORED IN STRINGS

| Identifier| addresses | value |
|------     |-----------|-------|
| R1C1 | R1C2 | R1C3 |
| R2C1 | R2C2 | R2C3 |
| R3C1 | R3C2 | R3C3 |
| R4C1 | R4C2 | R4C3 |
| R5C1 | R5C2 | R5C3 |
| R6C1 | R6C2 | R6C3 |
| R7C1 | R7C2 | R7C3 |
| R8C1 | R8C2 | R8C3 |
| R9C1 | R9C2 | R9C3 |
| R10C1| R10C2| R10C3 |


why objevts go in heap,

x= obj the x goes in stack and obj goes in heaps

let n1=31



Case 5


let f1 = {num:3, den:4, inverse:{num:4, den:3}};
let f2 = {...f1};
f1.num = 1;
f1.den = 2;
f1.inverse.num = 2;
f1.inverse.den = 1;

console.log(f2); 

| Step | Code run                          | f1                                           | f2                                           |
|------|------------------------------------|----------------------------------------------|----------------------------------------------|
| 1    | let f1 = {num:3, den:4, inverse:{num:4, den:3}}; | { num: 3, den: 4, inverse: { num: 4, den: 3 } } | —                                            |
| 2    | let f2 = {...f1};                  | { num: 3, den: 4, inverse: { num: 4, den: 3 } } | { num: 3, den: 4, inverse: { num: 4, den: 3 } } |
| 3    | f1.num = 1;                        | { num: 1, den: 4, inverse: { num: 4, den: 3 } } | { num: 3, den: 4, inverse: { num: 4, den: 3 } } |
| 4    | f1.den = 2;                        | { num: 1, den: 2, inverse: { num: 4, den: 3 } } | { num: 3, den: 4, inverse: { num: 4, den: 3 } } |
| 5    | f1.inverse.num = 2;                | { num: 1, den: 2, inverse: { num: 2, den: 3 } } | { num: 3, den: 4, inverse: { num: 2, den: 3 } } |
| 6    | f1.inverse.den = 1;                | { num: 1, den: 2, inverse: { num: 2, den: 1 } } | { num: 3, den: 4, inverse: { num: 2, den: 1 } } |














##SCOPES
- global
function myScope() {
  x = 5;
}

myScope();      // <-- call the function
console.log(x);
x leaks it to be global after function call






- function(var)
        as long as fucntion exists the varriable is accesible
        once you exit the ducntion var declred inside are out of score
        function myScope(a) {
          var  x = 5;
            }

            myScope(3);      // <-- call the function
            console.log(x);

            function myScope(a) {
                if(a<10>){return var x=10};
                }
                console.log(x)

                myScope(11);      // <-- call the function
                console.log(x);

                returns undefined




- lexical (let/const)
        with let you can modify not with const
        accessible under the most recent set of scoped operators in which they are defied

        
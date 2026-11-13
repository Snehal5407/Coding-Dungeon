const $ = s => document.querySelector(s);

const REGIONS = [
  {id:1,name:"BEGINNER MEADOWS",range:"Levels 1–20",start:1,end:20},
  {id:2,name:"DEBUG FOREST",range:"Levels 21–40",start:21,end:40},
  {id:3,name:"ALGORITHM CAVES",range:"Levels 41–60",start:41,end:60},
  {id:4,name:"DATA STRUCTURE RUINS",range:"Levels 61–80",start:61,end:80},
  {id:5,name:"DARK CODE REALM",range:"Levels 81–95",start:81,end:95},
  {id:6,name:"CODING CITADEL",range:"Levels 96–100",start:96,end:100}
];
const bossLevels=[10,20,30,40,50,60,70,80,90,95,99,100];
const names=["Bug Slime","Syntax Bat","Variable Goblin","Loop Spider","Boolean Beast","Null Wraith","Array Imp","String Sprite","Function Fang","Python Guardian",
"Indentation Ogre","Debug Fox","Pointer Phantom","Compile Crow","Logic Lizard","Class Crawler","Exception Wolf","Recursion Rat","Memory Mimic","Forest Compiler",
"Stack Scout","Queue Quake","Binary Beetle","Search Serpent","Sort Samurai","Tree Troll","Graph Ghoul","Hash Hydra","Pointer Knight","Algorithm Knight",
"Merge Mage","Quickblade","Heap Horror","Greedy Golem","DP Dragon","Recursion Demon","Complexity Crab","Code Minotaur","Runtime Reaper","Algorithm Lord",
"Crystal Coder","Cache Crawler","SQL Slime","Query Queen","Thread Thief","Process Phantom","Deadlock Demon","Kernel Kraken","Network Naga","Cave Compiler",
"Packet Pirate","Router Revenant","DBMS Beast","Index Imp","Transaction Titan","Mutex Monster","OS Oracle","Memory Dragon","Race Goblin","System Sage",
"Linked List Lich","Stack Specter","Queue Queen","Tree Titan","Graph Guardian","Heap Herald","Hash Hunter","Data Hydra","Structure Sage","Pointer Prime",
"Binary Boss","Traversal Tyrant","Sorting Sorcerer","Algorithm Atlas","Big-O Ogre","Dynamic Demon","Greedy Giant","Divide Dragon","Backtracking Beast","Code Colossus",
"Dark Debugger","Bug Baron","Exception Emperor","Runtime Raven","Compiler Witch","Syntax Reaper","Logic Lord","Code Phantom","Kernel King","Program Prime",
"Firewall Fiend","Database Dragon","Network Nemesis","OS Overlord","Architecture Ace","AI Automaton","Quantum Quester","Compiler Overlord","Code Destroyer","The Final Compiler"];

const state = {
  screen:"menu", currentLevel:1, playerLevel:1, hp:100,maxHp:100,xp:45,xpNeed:100,coins:65,streak:2,
  attack:15,defense:5,completed:[],weapons:["Syntax Sword"],abilities:["Debug Strike"],
  sound:true, questionIndex:0, enemyHp:0, battle:null, stats:{answered:0,correct:0,bestStreak:2,xpEarned:0,coinsEarned:0},
  achievements:[], crosswordWins:[], crosswordFound:{}, crosswordSelection:null, usedQuestions:[]
};

function difficulty(n){return n<=20?"EASY":n<=40?"EASY-MEDIUM":n<=60?"MEDIUM":n<=80?"MEDIUM-HARD":n<=95?"HARD":"VERY HARD";}
function regionFor(n){return REGIONS.find(r=>n>=r.start&&n<=r.end)||REGIONS[0]}
function enemyFor(n){
  const boss=bossLevels.includes(n);
  return {name:names[n-1],hp:boss?100+n*4:35+n*2,attack:boss?12+Math.floor(n/5):5+Math.floor(n/6),boss};
}

const qs = [
 {cat:"Python",q:"What does len([1, 2, 3]) return?",o:["2","3","4","Error"],a:1,e:"The list contains three elements.",d:"easy"},
 {cat:"Python",q:"What is the output?\nprint(2 + 3)",o:["4","5","23","Error"],a:1,e:"The + operator adds the two integers.",d:"easy"},
 {cat:"C",q:"Which symbol ends most C statements?",o:[".",":",";","#"],a:2,e:"A semicolon terminates a C statement.",d:"easy"},
 {cat:"HTML",q:"Which tag creates the largest heading?",o:["<h6>","<head>","<h1>","<title>"],a:2,e:"h1 is the highest-level HTML heading.",d:"easy"},
 {cat:"CSS",q:"Which property changes text color?",o:["font-style","color","text-color","paint"],a:1,e:"The CSS color property sets text color.",d:"easy"},
 {cat:"JavaScript",q:"What is the result of 3 === '3'?",o:["true","false","3","undefined"],a:1,e:"Strict equality checks both value and type.",d:"easy"},
 {cat:"C++",q:"Which keyword creates a class?",o:["object","class","structs","newclass"],a:1,e:"class defines a C++ class.",d:"easy"},
 {cat:"SQL",q:"Which command reads rows from a table?",o:["GET","READ","SELECT","OPEN"],a:2,e:"SELECT retrieves data from tables.",d:"easy"},
 {cat:"DSA",q:"Which structure follows LIFO?",o:["Queue","Stack","Graph","Heap"],a:1,e:"A stack is Last-In, First-Out.",d:"easy"},
 {cat:"OOP",q:"Bundling data and methods into one unit is:",o:["Abstraction","Inheritance","Encapsulation","Polymorphism"],a:2,e:"Encapsulation bundles data and methods and controls access.",d:"easy"},
 {cat:"Python",q:"What will range(3) produce?",o:["1,2,3","0,1,2","0,1,2,3","3 only"],a:1,e:"range(3) starts at 0 and stops before 3.",d:"easy"},
 {cat:"C",q:"Which format specifier prints an integer?",o:["%c","%f","%d","%s"],a:2,e:"%d is commonly used for decimal integers in printf.",d:"easy"},
 {cat:"Java",q:"Which keyword is used to inherit a class?",o:["inherits","extends","superclass","using"],a:1,e:"Java uses extends for class inheritance.",d:"easy"},
 {cat:"Networks",q:"Which device forwards packets between networks?",o:["Hub","Switch","Router","Monitor"],a:2,e:"A router connects and forwards traffic between networks.",d:"easy"},
 {cat:"DBMS",q:"A primary key should be:",o:["Duplicate","Unique","Always text","Optional"],a:1,e:"A primary key uniquely identifies each row.",d:"easy"},
 {cat:"OS",q:"Which is an operating system?",o:["Python","Linux","HTML","SQL"],a:1,e:"Linux is an operating system.",d:"easy"},
 {cat:"Algorithms",q:"Binary search requires the data to be:",o:["Random","Sorted","Duplicated","Encrypted"],a:1,e:"Binary search repeatedly halves a sorted search space.",d:"easy"},
 {cat:"Computer Architecture",q:"CPU stands for:",o:["Central Processing Unit","Computer Power Utility","Core Program Unit","Central Program User"],a:0,e:"CPU means Central Processing Unit.",d:"easy"},
 {cat:"Logic",q:"If x=5 and y=2, what is x % y?",o:["0","1","2","2.5"],a:1,e:"5 divided by 2 leaves remainder 1.",d:"easy"},
 {cat:"Debugging",q:"Which is usually a syntax error?",o:["Wrong algorithm","Missing bracket","Slow code","Wrong requirement"],a:1,e:"A missing bracket can make source code syntactically invalid.",d:"easy"},

 {cat:"Python",q:"What is printed?\nfor i in range(3):\n    print(i)",o:["1 2 3","0 1 2","0 1 2 3","3 2 1"],a:1,e:"range(3) gives 0, 1, and 2.",d:"medium"},
 {cat:"C",q:"What is the value of *(p) if p points to x=10?",o:["Address of x","10","p","Error"],a:1,e:"Dereferencing p accesses the value stored at its target.",d:"medium"},
 {cat:"C++",q:"Which concept lets one interface have multiple implementations?",o:["Encapsulation","Polymorphism","Compilation","Casting"],a:1,e:"Polymorphism allows the same interface to behave differently.",d:"medium"},
 {cat:"JavaScript",q:"What does [1,2,3].map(x => x*2) return?",o:["[1,2,3]","[2,4,6]","6","Error"],a:1,e:"map creates a new array by applying the function to every item.",d:"medium"},
 {cat:"SQL",q:"Which clause filters rows after SELECT?",o:["ORDER BY","WHERE","GROUP BY","JOIN"],a:1,e:"WHERE filters rows that satisfy a condition.",d:"medium"},
 {cat:"DSA",q:"Average lookup in a hash table is approximately:",o:["O(n²)","O(log n)","O(1)","O(n log n)"],a:2,e:"With a good hash function and table, average lookup is O(1).",d:"medium"},
 {cat:"Algorithms",q:"What is the time complexity of a loop that halves n each iteration?",o:["O(n)","O(log n)","O(n²)","O(1)"],a:1,e:"Halving repeatedly gives logarithmic iterations.",d:"medium"},
 {cat:"OOP",q:"Which relationship represents an 'is-a' relationship?",o:["Composition","Inheritance","Aggregation","Association"],a:1,e:"Inheritance models an is-a relationship.",d:"medium"},
 {cat:"OS",q:"A process waiting for a resource held by another process can contribute to:",o:["Deadlock","Compilation","Paging","Caching"],a:0,e:"Circular waiting for resources is a key deadlock condition.",d:"medium"},
 {cat:"Networks",q:"Which protocol is connection-oriented?",o:["UDP","IP","TCP","ARP"],a:2,e:"TCP establishes a reliable connection before data transfer.",d:"medium"},
 {cat:"DBMS",q:"Which normal form removes partial dependency?",o:["1NF","2NF","3NF","BCNF"],a:1,e:"Second normal form removes partial dependencies on a composite key.",d:"medium"},
 {cat:"Architecture",q:"Cache is used mainly to:",o:["Store backups","Reduce memory access time","Replace CPU","Encrypt RAM"],a:1,e:"Cache keeps frequently used data closer to the CPU.",d:"medium"},
 {cat:"Debugging",q:"A program works but gives the wrong result. This is most likely a:",o:["Syntax error","Logic error","Linker error","Indentation error"],a:1,e:"The program runs, but the algorithm or condition is wrong.",d:"medium"},

 {cat:"Algorithms",q:"A merge sort on n elements has time complexity:",o:["O(n)","O(log n)","O(n log n)","O(n²)"],a:2,e:"Merge sort splits logarithmically and merges each level in O(n).",d:"hard"},
 {cat:"DSA",q:"In a balanced binary search tree, search is:",o:["O(1)","O(log n)","O(n)","O(n²)"],a:1,e:"A balanced tree has logarithmic height.",d:"hard"},
 {cat:"C",q:"What does malloc return?",o:["An integer","A pointer to allocated memory","A file","A loop"],a:1,e:"malloc returns a pointer to a block of dynamically allocated memory.",d:"hard"},
 {cat:"C++",q:"A virtual function mainly supports:",o:["Compile-time constants","Runtime polymorphism","Memory allocation","Templates only"],a:1,e:"Virtual dispatch enables runtime polymorphism.",d:"hard"},
 {cat:"Python",q:"What does a decorator typically do?",o:["Deletes a function","Wraps or modifies function behavior","Creates RAM","Sorts lists"],a:1,e:"A decorator wraps a function to extend or modify its behavior.",d:"hard"},
 {cat:"SQL",q:"Which join returns only matching rows from both tables?",o:["LEFT JOIN","RIGHT JOIN","INNER JOIN","FULL JOIN"],a:2,e:"INNER JOIN returns rows with matching join conditions.",d:"hard"},
 {cat:"OS",q:"Which scheduling algorithm can cause starvation without aging?",o:["FCFS","Round Robin","Priority Scheduling","FIFO"],a:2,e:"Low-priority processes may wait indefinitely in priority scheduling.",d:"hard"},
 {cat:"Networks",q:"What does DNS primarily translate?",o:["MAC to CPU","Domain names to IP addresses","Ports to files","HTML to CSS"],a:1,e:"DNS resolves human-readable domain names to IP addresses.",d:"hard"},
 {cat:"Complexity",q:"If T(n)=2T(n/2)+n, the complexity is:",o:["O(log n)","O(n)","O(n log n)","O(n²)"],a:2,e:"By the Master Theorem, this recurrence is Θ(n log n).",d:"hard"},
 {cat:"Recursion",q:"What prevents infinite recursion?",o:["A base case","A loop","A pointer","A class"],a:0,e:"A base case stops recursive calls.",d:"hard"},
 {cat:"Graphs",q:"BFS commonly uses which structure?",o:["Stack","Queue","Heap","Set only"],a:1,e:"BFS explores nodes level by level using a queue.",d:"hard"},
 {cat:"Trees",q:"Which traversal of a BST produces sorted order?",o:["Preorder","Postorder","Inorder","Level order"],a:2,e:"Inorder traversal of a BST visits keys in ascending order.",d:"hard"},
 {cat:"Debugging",q:"A null pointer dereference is primarily a:",o:["Runtime error","Syntax error","CSS error","Compile comment"],a:0,e:"Dereferencing null at runtime can crash the program.",d:"hard"},
 {cat:"OOP",q:"Composition generally represents:",o:["has-a","is-a","uses-only","same-as"],a:0,e:"Composition models a strong has-a relationship.",d:"hard"},

 {cat:"Algorithms",q:"What is the worst-case time complexity of quicksort with consistently poor pivots?",o:["O(log n)","O(n)","O(n log n)","O(n²)"],a:3,e:"Bad pivot choices can create partitions of size n-1 and 0, giving O(n²).",d:"very-hard"},
 {cat:"DSA",q:"Which data structure supports efficient min extraction in a binary heap?",o:["Max heap only","Min heap","Stack","Linked list only"],a:1,e:"The root of a min heap is the minimum element.",d:"very-hard"},
 {cat:"OS",q:"Which condition is NOT one of Coffman's four deadlock conditions?",o:["Mutual exclusion","Hold and wait","Circular wait","Preemption"],a:3,e:"The condition is no preemption, not preemption.",d:"very-hard"},
 {cat:"DBMS",q:"A transaction that has executed COMMIT cannot normally be undone by ROLLBACK because of:",o:["Atomicity","Durability","Isolation","Consistency"],a:1,e:"Durability means committed changes persist.",d:"very-hard"},
 {cat:"Networks",q:"TCP congestion control increases its sending rate cautiously after loss because:",o:["Loss can indicate congestion","DNS is slow","UDP requires it","IP is encrypted"],a:0,e:"Packet loss is treated as a signal that the network may be congested.",d:"very-hard"},
 {cat:"Architecture",q:"In a write-back cache, main memory is updated:",o:["On every read","On every write immediately","When a dirty cache line is evicted","Never"],a:2,e:"Write-back delays memory updates until eviction of a modified line.",d:"very-hard"},
 {cat:"Algorithms",q:"Dynamic programming is especially useful when a problem has:",o:["Only sorting","Overlapping subproblems and optimal substructure","No recursion","Only graphs"],a:1,e:"Those two properties are the classic signals for DP.",d:"very-hard"},
 {cat:"Debugging",q:"A race condition occurs when:",o:["Only one thread runs","Program output depends on timing of concurrent accesses","A loop is slow","A compiler is missing"],a:1,e:"Unsynchronized concurrent accesses can make results timing-dependent.",d:"very-hard"},
 {cat:"C++",q:"RAII in C++ ties resource lifetime to:",o:["A global variable","Object lifetime","The CPU clock","A database"],a:1,e:"Resources are acquired/released according to object construction/destruction.",d:"very-hard"},
 {cat:"Security",q:"Why is parameterized SQL preferred over string concatenation?",o:["It increases font size","It helps prevent SQL injection","It removes indexes","It disables joins"],a:1,e:"Parameters keep data separate from SQL code.",d:"very-hard"}
];


// --- C++ + OOP QUESTION BANK ---
// The game now uses only C++ and OOP questions.
const EXTRA_CPP_OOP = [
 {cat:"C++",q:"Which operator is used to access members through an object?",o:["->",".","::","#"],a:1,e:"The dot operator accesses members of an object directly.",d:"easy"},
 {cat:"C++",q:"Which header is commonly used for cout and cin?",o:["stdio.h","iostream","string.h","stdlib.h"],a:1,e:"iostream provides standard C++ input and output streams.",d:"easy"},
 {cat:"C++",q:"Which statement creates an object of class Car?",o:["Car();","Car car;","object Car;","new Car(); only"],a:1,e:"Car car; creates a Car object using the default constructor.",d:"easy"},
 {cat:"OOP",q:"Which OOP concept hides unnecessary implementation details?",o:["Inheritance","Abstraction","Overloading","Compilation"],a:1,e:"Abstraction shows essential features and hides implementation details.",d:"easy"},
 {cat:"OOP",q:"Which concept allows a child class to reuse a parent class?",o:["Encapsulation","Inheritance","Abstraction","Binding"],a:1,e:"Inheritance allows a derived class to reuse members of a base class.",d:"easy"},
 {cat:"C++",q:"What does cout do?",o:["Takes input","Displays output","Creates a class","Deletes memory"],a:1,e:"cout is the standard C++ output stream.",d:"easy"},
 {cat:"OOP",q:"Which access specifier makes members accessible from outside the class?",o:["private","protected","public","hidden"],a:2,e:"public members can be accessed from outside the class.",d:"easy"},
 {cat:"C++",q:"Which symbol is used before a pointer variable declaration?",o:["&","*","#","@"],a:1,e:"For example, int *p declares p as a pointer to int.",d:"easy"},
 {cat:"OOP",q:"A class is mainly a blueprint for creating what?",o:["Loops","Objects","Functions only","Headers"],a:1,e:"A class defines the data and behavior used to create objects.",d:"easy"},
 {cat:"C++",q:"Which keyword is used to create dynamic memory?",o:["malloc","new","create","alloc"],a:1,e:"new dynamically allocates memory in C++.",d:"easy"},

 {cat:"C++",q:"What is a constructor?",o:["A function called when an object is created","A destructor","A variable","A loop"],a:0,e:"A constructor initializes an object when it is created.",d:"medium"},
 {cat:"C++",q:"Which keyword refers to the current object?",o:["self","this","current","object"],a:1,e:"this is a pointer to the current object.",d:"medium"},
 {cat:"OOP",q:"Which type of polymorphism is function overloading?",o:["Runtime","Compile-time","Hardware","Database"],a:1,e:"Function overloading is resolved at compile time.",d:"medium"},
 {cat:"C++",q:"What is function overloading?",o:["Same name with different parameter lists","Same function twice","Deleting a function","Calling a function recursively"],a:0,e:"Overloaded functions have the same name but different parameter lists.",d:"medium"},
 {cat:"OOP",q:"Which relationship is commonly called an 'is-a' relationship?",o:["Inheritance","Composition","Association","Aggregation"],a:0,e:"Inheritance represents an is-a relationship.",d:"medium"},
 {cat:"C++",q:"What is function overriding?",o:["Derived class provides a new version of a base class method","Changing variable type","Deleting a function","Overloading operators only"],a:0,e:"Overriding lets a derived class redefine an inherited virtual method.",d:"medium"},
 {cat:"OOP",q:"Which concept combines data and methods inside a class?",o:["Encapsulation","Recursion","Iteration","Compilation"],a:0,e:"Encapsulation keeps data and related methods together in a class.",d:"medium"},
 {cat:"C++",q:"Which keyword prevents a class from being inherited?",o:["stop","sealed","final","private"],a:2,e:"A class declared final cannot be used as a base class.",d:"medium"},
 {cat:"C++",q:"Which operator is overloaded for stream output?",o:["<<","::","&&","%%"],a:0,e:"The << operator is commonly overloaded with cout for object output.",d:"medium"},
 {cat:"OOP",q:"Which feature allows one class to have multiple constructors?",o:["Constructor overloading","Inheritance","Abstraction","Friendship"],a:0,e:"A class can have multiple constructors with different parameter lists.",d:"medium"},

 {cat:"C++",q:"What is the purpose of a virtual function?",o:["Runtime polymorphism","Memory deletion","File creation","Loop control"],a:0,e:"Virtual functions support dynamic dispatch and runtime polymorphism.",d:"hard"},
 {cat:"OOP",q:"Which principle says a class should have one main reason to change?",o:["Single Responsibility Principle","Open Loop Principle","Inheritance Rule","Pointer Rule"],a:0,e:"The Single Responsibility Principle gives a class one main responsibility.",d:"hard"},
 {cat:"C++",q:"What is a pure virtual function?",o:["A function with = 0","A private function","A static function","A constructor"],a:0,e:"A pure virtual function is declared with = 0 and makes a class abstract.",d:"hard"},
 {cat:"OOP",q:"What is an abstract class?",o:["A class that cannot be instantiated directly","A class with no variables","A private class","A final object"],a:0,e:"An abstract class cannot be instantiated directly and often contains pure virtual functions.",d:"hard"},
 {cat:"C++",q:"Which cast is generally used for a safe checked downcast in a polymorphic hierarchy?",o:["static_cast","dynamic_cast","const_cast","reinterpret_cast"],a:1,e:"dynamic_cast performs a runtime-checked cast for polymorphic types.",d:"hard"},
 {cat:"OOP",q:"Which relationship represents a strong whole-part relationship?",o:["Composition","Inheritance","Polymorphism","Overloading"],a:0,e:"Composition models strong ownership between a whole and its parts.",d:"hard"},
 {cat:"C++",q:"What does RAII connect resource management to?",o:["Object lifetime","CPU speed","Loops","Namespaces"],a:0,e:"RAII ties resource acquisition and release to object lifetime.",d:"hard"},
 {cat:"OOP",q:"What is runtime polymorphism mainly achieved with in C++?",o:["Virtual functions","Macros","Templates only","Namespaces"],a:0,e:"Virtual functions enable runtime method dispatch through base pointers/references.",d:"hard"},
 {cat:"C++",q:"What is the main purpose of a destructor?",o:["Release resources when an object is destroyed","Create objects","Overload operators","Start a program"],a:0,e:"A destructor performs cleanup when an object's lifetime ends.",d:"hard"},
 {cat:"OOP",q:"Which principle means high-level code should depend on abstractions rather than concrete classes?",o:["Dependency Inversion","Inheritance","Encapsulation","Overloading"],a:0,e:"Dependency Inversion encourages depending on abstractions rather than concrete implementations.",d:"hard"},

 {cat:"C++",q:"What is object slicing?",o:["Losing derived-class data when copying a derived object into a base object by value","Deleting an object","Splitting an array","Removing a pointer"],a:0,e:"Copying a derived object into a base object by value keeps only the base subobject.",d:"very-hard"},
 {cat:"OOP",q:"Why should a polymorphic base class often have a virtual destructor?",o:["To allow correct cleanup through a base pointer","To speed up loops","To overload constructors","To hide variables"],a:0,e:"A virtual destructor ensures the derived destructor runs when deleting through a base pointer.",d:"very-hard"},
 {cat:"C++",q:"Which special member function is called when an object is copied to initialize another object?",o:["Copy constructor","Destructor","Move assignment only","Default argument"],a:0,e:"The copy constructor initializes a new object from an existing object.",d:"very-hard"},
 {cat:"OOP",q:"Which SOLID principle encourages classes to be open for extension but closed for modification?",o:["Open/Closed Principle","Single Responsibility","Interface Segregation","Dependency Inversion"],a:0,e:"The Open/Closed Principle says software should be open for extension but closed for modification.",d:"very-hard"},
 {cat:"C++",q:"What is move semantics mainly used to reduce?",o:["Unnecessary copying","Class size","Function names","Inheritance"],a:0,e:"Move semantics can transfer resources instead of making expensive copies.",d:"very-hard"},
 {cat:"OOP",q:"Which principle says clients should not be forced to depend on methods they do not use?",o:["Interface Segregation","Inheritance","Encapsulation","Polymorphism"],a:0,e:"Interface Segregation promotes small, focused interfaces.",d:"very-hard"},
 {cat:"C++",q:"Which keyword makes a data member accessible only inside its class?",o:["public","private","protected","friend"],a:1,e:"private members are hidden from normal outside access.",d:"easy"},
 {cat:"OOP",q:"Which keyword makes a variable read-only after initialization?",o:["const","fixed","readonly","final"],a:0,e:"const prevents a variable from being modified after initialization.",d:"easy"},
 {cat:"C++",q:"Which operator dereferences a pointer?",o:["&","*","->","::"],a:1,e:"The * operator accesses the value stored at the pointer's address.",d:"easy"},
 {cat:"OOP",q:"Same function name with different parameter lists is called:",o:["Overloading","Overriding","Inheritance","Abstraction"],a:0,e:"Function overloading uses the same name with different parameters.",d:"easy"},
 {cat:"C++",q:"Which STL container follows FIFO order?",o:["stack","queue","set","vector"],a:1,e:"A queue serves the first element inserted first.",d:"medium"},
 {cat:"OOP",q:"Which keyword refers to the current object?",o:["self","this","current","object"],a:1,e:"this is a pointer to the current object.",d:"medium"},
 {cat:"C++",q:"Which access specifier is available to a class and its derived classes?",o:["public","private","protected","static"],a:2,e:"protected members are accessible inside the class and derived classes.",d:"medium"},
 {cat:"OOP",q:"What is the main purpose of a getter?",o:["Read controlled private data","Delete an object","Create inheritance","Start a program"],a:0,e:"A getter provides controlled access to a private data member.",d:"medium"},
 {cat:"C++",q:"What is a namespace mainly used for?",o:["Avoiding name conflicts","Creating objects","Allocating memory","Sorting data"],a:0,e:"Namespaces help prevent naming conflicts between identifiers.",d:"medium"},
 {cat:"OOP",q:"A function declared with '= 0' in a base class is called:",o:["Pure virtual function","Static function","Friend function","Inline function"],a:0,e:"= 0 makes a virtual function pure virtual.",d:"medium"},
 {cat:"C++",q:"Which STL container stores unique sorted values?",o:["set","vector","queue","stack"],a:0,e:"std::set stores unique elements in sorted order.",d:"medium"},
 {cat:"OOP",q:"A child class providing a new implementation of a virtual function is:",o:["Overriding","Overloading","Aggregation","Casting"],a:0,e:"Overriding replaces the base implementation in a derived class.",d:"medium"},
 {cat:"C++",q:"Which smart pointer represents exclusive ownership?",o:["unique_ptr","shared_ptr","weak_ptr","raw_ptr"],a:0,e:"unique_ptr owns one dynamically allocated object at a time.",d:"hard"},
 {cat:"OOP",q:"Which SOLID principle gives a class one main reason to change?",o:["Single Responsibility","Open/Closed","Interface Segregation","Dependency Inversion"],a:0,e:"The Single Responsibility Principle focuses a class on one responsibility.",d:"hard"},
 {cat:"C++",q:"What does std::move mainly help avoid?",o:["Unnecessary copying","Inheritance","Compilation","Exceptions"],a:0,e:"Move semantics can transfer resources instead of copying them.",d:"hard"},
 {cat:"OOP",q:"Which principle allows derived objects to replace base objects safely?",o:["Liskov Substitution","Single Responsibility","Open/Closed","Encapsulation"],a:0,e:"Liskov Substitution says derived types should be substitutable for base types.",d:"hard"},
 {cat:"C++",q:"What is the average lookup complexity of unordered_map?",o:["O(1)","O(log n)","O(n)","O(n²)"],a:0,e:"Hashing gives unordered_map average constant-time lookup.",d:"hard"},
 {cat:"OOP",q:"What is late binding?",o:["Selecting an overridden method at runtime","Compiling later","Allocating memory early","Creating a class"],a:0,e:"Late binding chooses the correct overridden implementation at runtime.",d:"hard"},
 {cat:"C++",q:"Which smart pointer allows multiple owners?",o:["shared_ptr","unique_ptr","weak_ptr","raw_ptr"],a:0,e:"shared_ptr supports shared ownership of an object.",d:"hard"},
 {cat:"OOP",q:"What does dependency injection mainly reduce?",o:["Tight coupling","Inheritance","Polymorphism","Compilation"],a:0,e:"Dependencies are supplied from outside, reducing tight coupling.",d:"hard"},
 {cat:"C++",q:"Which special function is called when an object goes out of scope?",o:["Destructor","Constructor","Getter","Setter"],a:0,e:"The destructor is automatically called when an object's lifetime ends.",d:"hard"},

 {cat:"C++",q:"Which keyword is used to allocate memory dynamically with new?",o:["new","malloc","alloc","create"],a:0,e:"new creates an object or allocates dynamic storage in C++.",d:"easy"},
 {cat:"OOP",q:"Which concept combines data and functions inside a class?",o:["Encapsulation","Recursion","Sorting","Casting"],a:0,e:"Encapsulation keeps related data and methods together in a class.",d:"easy"},
 {cat:"C++",q:"Which stream is normally used to display output?",o:["cin","cout","cerrin","input"],a:1,e:"cout is the standard output stream in C++.",d:"easy"},
 {cat:"OOP",q:"Which OOP concept means creating objects from a class?",o:["Instantiation","Inheritance","Overriding","Abstraction"],a:0,e:"Instantiation is the process of creating an object from a class.",d:"easy"},
 {cat:"C++",q:"Which keyword is used to define a derived class?",o:["extends","inherits",":","derive"],a:2,e:"C++ uses a colon after the derived class name to specify inheritance.",d:"medium"},
 {cat:"OOP",q:"Which relationship is a weak whole-part relationship?",o:["Aggregation","Inheritance","Overriding","Polymorphism"],a:0,e:"Aggregation represents a whole-part relationship without strong ownership.",d:"medium"},
 {cat:"C++",q:"Which operator accesses a member through a pointer to an object?",o:[".","->","::","*"],a:1,e:"The arrow operator accesses a member through an object pointer.",d:"medium"},
 {cat:"OOP",q:"Which access level makes members visible to all code using the object?",o:["private","protected","public","hidden"],a:2,e:"Public members can be accessed from outside the class.",d:"medium"},
 {cat:"C++",q:"Which function is automatically called when an object is created?",o:["Destructor","Constructor","Getter","Operator"],a:1,e:"A constructor initializes an object when it is created.",d:"medium"},
 {cat:"OOP",q:"What is abstraction mainly concerned with?",o:["Showing essential features","Copying objects","Sorting arrays","Deleting pointers"],a:0,e:"Abstraction focuses on essential behavior while hiding unnecessary details.",d:"medium"},
 {cat:"C++",q:"Which keyword can prevent a virtual function from being overridden further?",o:["final","stop","sealed","freeze"],a:0,e:"The final specifier prevents further overriding of a virtual function.",d:"medium"},
 {cat:"OOP",q:"Which concept allows an object to take different forms?",o:["Polymorphism","Encapsulation","Composition","Instantiation"],a:0,e:"Polymorphism means one interface can have different forms of behavior.",d:"medium"},
 {cat:"C++",q:"Which operator is overloaded to compare two objects for equality?",o:["=","==","!=","=>"],a:1,e:"The == operator tests equality and can be overloaded for user-defined types.",d:"medium"},
 {cat:"OOP",q:"What does inheritance primarily promote?",o:["Code reuse","Data deletion","Random execution","Memory leaks"],a:0,e:"Inheritance allows a derived class to reuse and extend base-class behavior.",d:"medium"},
 {cat:"C++",q:"Which STL container stores key-value pairs in sorted key order?",o:["map","queue","vector","stack"],a:0,e:"std::map stores key-value pairs ordered by key.",d:"medium"},
 {cat:"OOP",q:"What is a base class?",o:["A class inherited from","A parent class used for inheritance","A class with no methods","An object"],a:1,e:"A base class provides members that a derived class can inherit.",d:"medium"},
 {cat:"C++",q:"Which keyword is used to explicitly throw an exception?",o:["throw","throws","raise","error"],a:0,e:"The throw keyword signals an exception in C++.",d:"medium"},
 {cat:"OOP",q:"What is coupling?",o:["Degree of dependency between modules","Number of methods","Object size","Inheritance depth only"],a:0,e:"Coupling describes how strongly software components depend on each other.",d:"medium"},
 {cat:"C++",q:"Which keyword can make a member function unable to modify normal data members?",o:["const","static","final","safe"],a:0,e:"A const member function promises not to modify the object's normal state.",d:"medium"},
 {cat:"OOP",q:"What is cohesion?",o:["How closely related a class's responsibilities are","Number of objects","Inheritance count","Memory usage"],a:0,e:"High cohesion means a class's responsibilities are closely related.",d:"medium"},
 {cat:"C++",q:"Which STL container is commonly used for LIFO behavior?",o:["stack","queue","map","set"],a:0,e:"std::stack provides Last-In-First-Out behavior.",d:"medium"},
 {cat:"OOP",q:"What is an object?",o:["An instance of a class","A header file","A loop","A compiler"],a:0,e:"An object is an instance created from a class definition.",d:"medium"},
 {cat:"C++",q:"Which keyword can declare a member shared by all objects of a class?",o:["static","shared","global","common"],a:0,e:"A static data member belongs to the class rather than each individual object.",d:"medium"},
 {cat:"OOP",q:"Which design principle favors depending on abstractions?",o:["Dependency Inversion","Inheritance","Encapsulation","Overloading"],a:0,e:"Dependency Inversion encourages high-level code to depend on abstractions.",d:"medium"},
 {cat:"C++",q:"Which header provides std::string?",o:["string","text","str","cstringonly"],a:0,e:"The <string> header provides std::string.",d:"medium"},
 {cat:"OOP",q:"What is a constructor overload?",o:["Multiple constructors with different parameter lists","A constructor in a child class only","A destructor","A virtual variable"],a:0,e:"A class can have multiple constructors with different parameter lists.",d:"medium"},
 {cat:"C++",q:"Which STL container uses hashing for key lookup?",o:["unordered_map","vector","list","stack"],a:0,e:"unordered_map uses hashing for average constant-time key lookup.",d:"medium"},
 {cat:"OOP",q:"Which concept hides implementation details behind a simple interface?",o:["Abstraction","Inheritance","Aggregation","Overloading"],a:0,e:"Abstraction exposes what is needed while hiding implementation details.",d:"medium"},
 {cat:"C++",q:"What is a reference in C++?",o:["An alias for another object","A new object always","A pointer with no target","A class"],a:0,e:"A reference is another name for an existing object or variable.",d:"hard"},
 {cat:"OOP",q:"Why should a base destructor be virtual in a polymorphic hierarchy?",o:["For correct derived cleanup","For faster compilation","To overload constructors","To prevent inheritance"],a:0,e:"A virtual destructor ensures derived cleanup when deleting through a base pointer.",d:"hard"},
 {cat:"C++",q:"What problem can a dangling pointer cause?",o:["Undefined behavior","Automatic sorting","Inheritance","Compilation speed"],a:0,e:"Using a pointer after its target is gone can cause undefined behavior.",d:"hard"},
 {cat:"OOP",q:"What is tight coupling?",o:["Strong dependency between components","Strong encapsulation","Many constructors","Fast execution"],a:0,e:"Tight coupling means components depend heavily on each other's implementation.",d:"hard"},
 {cat:"C++",q:"What does a move constructor receive to transfer resources?",o:["An rvalue reference","A constant integer","A class name","A namespace"],a:0,e:"A move constructor commonly takes an rvalue reference to the source object.",d:"hard"},
 {cat:"OOP",q:"Which principle encourages small focused interfaces?",o:["Interface Segregation","Single Responsibility","Open/Closed","Inheritance"],a:0,e:"Interface Segregation favors smaller interfaces that clients actually need.",d:"hard"},
 {cat:"C++",q:"What is operator overloading?",o:["Giving an operator behavior for a user-defined type","Changing compiler syntax","Deleting operators","Creating a loop"],a:0,e:"Operator overloading lets operators work with user-defined classes and objects.",d:"hard"},
 {cat:"OOP",q:"What is a virtual table commonly associated with?",o:["Runtime virtual dispatch","Static arrays","File handling","Templates only"],a:0,e:"A vtable is commonly used to support runtime dispatch of virtual functions.",d:"hard"},
 {cat:"C++",q:"What is a memory leak?",o:["Allocated memory that is no longer reachable or released","A syntax error","A full stack","A compiler warning only"],a:0,e:"A memory leak occurs when allocated memory is not released and can no longer be used.",d:"hard"},
 {cat:"OOP",q:"Which concept is most closely related to substituting derived objects for base objects?",o:["Polymorphism","Encapsulation","Composition","Instantiation"],a:0,e:"Polymorphism allows derived implementations to be used through base interfaces.",d:"hard"},
 {cat:"C++",q:"What is the purpose of a friend function?",o:["Allow selected non-member code access to private members","Create inheritance","Replace constructors","Prevent objects"],a:0,e:"A friend function can access private and protected members when declared as a friend.",d:"hard"},
 {cat:"OOP",q:"Which relationship is represented by 'has-a'?",o:["Composition or aggregation","Inheritance","Overriding","Polymorphism only"],a:0,e:"Has-a commonly describes composition or aggregation relationships.",d:"hard"},

];
const QUESTION_BANK = qs.filter(q=>q.cat==="C++" || q.cat==="OOP").concat(EXTRA_CPP_OOP);

// --- SIMPLE PIXEL SOUND ENGINE ---
const audio = {ctx:null, master:null, musicTimer:null, step:0};
function initAudio(){
  if(audio.ctx) { if(audio.ctx.state === "suspended") audio.ctx.resume(); return; }
  try{
    audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = 0.07;
    audio.master.connect(audio.ctx.destination);
    if(state.sound) startMusic();
  }catch(e){ console.log("Audio unavailable",e); }
}
function tone(freq,duration=.08,type="square",volume=.06){
  if(!state.sound || !audio.ctx || !audio.master) return;
  const o=audio.ctx.createOscillator(), g=audio.ctx.createGain();
  o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(volume,audio.ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,audio.ctx.currentTime+duration);
  o.connect(g); g.connect(audio.master); o.start(); o.stop(audio.ctx.currentTime+duration);
}
function playSound(kind){
  if(!state.sound)return;
  const sets={click:[520,.05],correct:[660,.08],wrong:[180,.14],hit:[300,.07],win:[880,.2],boss:[110,.18]};
  const x=sets[kind]||sets.click; tone(x[0],x[1]);
  if(kind==="correct") setTimeout(()=>tone(880,.1),90);
  if(kind==="win") setTimeout(()=>tone(1100,.18),180);
}
function startMusic(){
  if(audio.musicTimer || !audio.ctx || !state.sound)return;
  const notes=[261.63,329.63,392,329.63,293.66,349.23,440,349.23,261.63,329.63,392,523.25,440,392,329.63,293.66];
  audio.step=0;
  audio.musicTimer=setInterval(()=>{
    if(!state.sound || !audio.ctx)return;
    tone(notes[audio.step%notes.length],.12,"square",.025);
    audio.step++;
  },260);
}
function stopMusic(){if(audio.musicTimer){clearInterval(audio.musicTimer);audio.musicTimer=null;}}
function toggleSound(){
  state.sound=!state.sound;
  if(state.sound){initAudio();startMusic();playSound("click");}
  else stopMusic();
  $("#soundBtn").textContent=state.sound?"🔊":"🔇"; toast(state.sound?"Sound + music ON":"Sound + music OFF"); save();
}

function pickQuestion(level){
  const target = level<=20?"easy":level<=60?"medium":level<=95?"hard":"very-hard";
  let pool=QUESTION_BANK.filter(x=>x.d===target && !state.usedQuestions.includes(x.q));
  if(!pool.length) pool=QUESTION_BANK.filter(x=>!state.usedQuestions.includes(x.q));
  if(!pool.length){
    state.usedQuestions=[];
    pool=QUESTION_BANK.filter(x=>x.d===target);
  }
  const q=pool[Math.floor(Math.random()*pool.length)];
  state.usedQuestions.push(q.q);
  return {...q, options:[...q.o]};
}

function makeLevel(n){
  const e=enemyFor(n), r=regionFor(n);
  return {number:n,difficulty:difficulty(n),enemy:e,region:r,question:pickQuestion(n),
    xp:25+n*4, coins:8+Math.floor(n*1.7)};
}
const LEVELS=Array.from({length:100},(_,i)=>{
  const n=i+1,e=enemyFor(n),r=regionFor(n);
  return {number:n,difficulty:difficulty(n),enemy:e,region:r,xp:25+n*4,coins:8+Math.floor(n*1.7)};
});

function save(){localStorage.setItem("codingDungeonSave",JSON.stringify(state))}
function load(){
  try{const s=JSON.parse(localStorage.getItem("codingDungeonSave"));if(s)Object.assign(state,s)}catch(e){}
  if(!Array.isArray(state.usedQuestions)) state.usedQuestions=[];
  if(!Array.isArray(state.crosswordWins)) state.crosswordWins=[];
  // Always open on the main menu. Progress is still preserved.
  state.screen="menu";
}
function toast(t){$("#toast").textContent=t;clearTimeout(window.__toast);window.__toast=setTimeout(()=>$("#toast").textContent="Let's code! 🐙",1800)}
function updateHud(){
  $("#hpText").textContent=`${state.hp}/${state.maxHp}`; $("#hpBar").style.width=(state.hp/state.maxHp*100)+"%";
  $("#playerLevel").textContent=state.playerLevel; $("#xpText").textContent=`${state.xp}/${state.xpNeed}`; $("#xpBar").style.width=(state.xp/state.xpNeed*100)+"%";
  $("#streak").textContent=state.streak; $("#coins").textContent=state.coins;
  const r=regionFor(state.currentLevel); $("#regionNumber").textContent=String(r.id).padStart(2,"0"); $("#regionName").textContent=r.name; $("#regionRange").textContent=r.range;
}
function render(){
  updateHud();
  if(state.screen==="menu") renderMenu();
  else if(state.screen==="map") renderMap();
  else if(state.screen==="battle") renderBattle();
  else if(state.screen==="levels") renderLevels();
  else if(state.screen==="crossword") renderCrossword();
  else if(state.screen==="achievements") renderAchievements();
  else if(state.screen==="hero") renderHero();
}
function renderMenu(){
 $("#screen").innerHTML=`<div class="menu"><div class="menu-inner">
  <div class="hero-icons">⚔️ 🛡️ 🐉</div>
  <div class="game-title">CODING DUNGEON</div>
  <div class="subtitle">A 100-Level Retro Pixel-Art Programming Adventure</div>
  <button class="menu-btn primary" onclick="startAdventure()">⚔ START ADVENTURE</button>
  <button class="menu-btn" onclick="state.screen='levels';render()">🗺 LEVEL SELECT</button>
  <button class="menu-btn" onclick="openCrossword()">🧩 CODE CROSSWORD · ${Math.min(10,Math.floor(state.completed.length/5))}/10 UNLOCKED</button>
  <button class="menu-btn" onclick="state.screen='hero';render()">🎒 HERO INVENTORY</button>
  <button class="menu-btn" onclick="state.screen='achievements';render()">🏆 ACHIEVEMENTS</button>
  <button class="menu-btn" onclick="openSettings()">⚙ SETTINGS</button>
  <button class="menu-btn" onclick="openHowTo()">❓ HOW TO PLAY</button>
 </div></div>`;
}
function startAdventure(){
  initAudio();
  playSound("click");
  if(!localStorage.getItem("codingDungeonSeen")){
    localStorage.setItem("codingDungeonSeen","1");
    showModal(`<h2>WELCOME, CODER!</h2><p>Your mission is to defeat 100 coding enemies and conquer the dungeon.<br><br>✓ Correct answer → YOU ATTACK<br>✗ Wrong answer → ENEMY ATTACKS</p><button onclick="closeModal();state.screen='map';render()">BEGIN ADVENTURE</button>`);
  }else{state.screen="map";render()}
}
function renderMap(){
 const r=regionFor(state.currentLevel);
 const colors=["#5fbf64","#3f9a59","#49686b","#70766a","#403b67","#453b50"];
 $("#screen").innerHTML=`<div class="map" style="background-color:${colors[r.id-1]}">
  <div class="map-title">${r.name}<br><small>${r.range}</small></div>
  <div class="map-path"></div><div class="bridge"></div>
  <div class="map-water" aria-hidden="true"></div>
  <div class="map-chest chest-one" aria-hidden="true">🎁</div>
  <div class="map-chest chest-two" aria-hidden="true">🧰</div>
  <div class="map-fireflies" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
  ${Array.from({length:20},(_,i)=>{let n=r.start+i;let x=7+(i%10)*9.2,y=27+(i>=10?35:0)+(i%3)*5;let done=state.completed.includes(n),locked=n>state.currentLevel;const action=locked?`toast('🔒 Complete the previous level first!')`:`enterLevel(${n})`; return `<button class="level-node ${done?"completed":""} ${locked?"locked":""} ${bossLevels.includes(n)?"boss":""} ${n===state.currentLevel?"current":""}" style="left:${x}%;top:${y}%" onclick="${action}">${bossLevels.includes(n)?"👑":n}</button>`}).join("")}
  <div class="player" id="mapPlayer" style="left:46%;top:72%"></div>
  <div class="map-help">WASD / ARROWS • Tap a level<br>💡 Complete levels to unlock the path</div>
  <div class="mobile-dpad" aria-label="Map controls"><button onclick="moveMap(0,-1)">▲</button><div><button onclick="moveMap(-1,0)">◀</button><button onclick="moveMap(0,1)">▼</button><button onclick="moveMap(1,0)">▶</button></div></div>
 </div>`;
}
function enterLevel(n){
 if(n>state.currentLevel && !state.completed.includes(n-1)){toast("🔒 Complete the previous level first!");return}
 state.currentLevel=n; state.screen="battle"; state.battle=makeLevel(n); state.enemyHp=state.battle.enemy.hp; state.questionIndex++; save(); render()
}
function renderBattle(){
 const l=state.battle||makeLevel(state.currentLevel), q=l.question, e=l.enemy;
 const pct=Math.max(0,state.enemyHp/e.hp*100);
 $("#screen").innerHTML=`<div class="battle">
 <div class="enemy-head">
  <div class="lvbox">LV<br>${l.number}</div><div class="enemy-name">${e.name}</div>
  <div class="statbar"><div class="bar"><i style="width:${pct}%"></i></div><b>${state.enemyHp}/${e.hp}</b>❤️</div>
  <div class="statbar"><div class="bar playerbar"><i style="width:${state.hp/state.maxHp*100}%"></i></div><b>${state.hp}/${state.maxHp}</b>♥</div>
  <button class="esc" onclick="state.screen='map';render()">⚔<br>ESC</button>
 </div>
 <div class="battle-arena ${l.boss?'boss-arena':''}">
   <div class="battle-player character-hero" aria-label="Hero"><span class="char-shadow"></span><span class="char-hair"></span><span class="char-face"><i></i><b></b></span><span class="char-body"></span><span class="char-arm"></span><span class="char-leg leg-one"></span><span class="char-leg leg-two"></span><span class="char-weapon">⚔</span></div>
   <div class="enemy-sprite character-enemy ${l.boss?'character-boss':''}" aria-label="${escapeHtml(e.name)}"><span class="char-shadow"></span><span class="enemy-cape"></span><span class="char-hair"></span><span class="char-face"><i></i><b></b></span><span class="char-body"></span><span class="char-arm"></span><span class="char-leg leg-one"></span><span class="char-leg leg-two"></span><span class="char-weapon">✦</span></div>
 </div>
 <div>
  <div class="skill-row"><button class="skill" onclick="useAbility()">⚡ Debug Strike <small>20 MP</small></button></div>
  <div class="question-panel">
   <div class="question-meta"><span class="tag">${q.cat}</span><span class="difficulty">${l.difficulty}</span><span>Answer correctly to attack!</span></div>
   <div class="question">${escapeHtml(q.q)}</div>
   <div class="answers">${q.o.map((x,i)=>`<button class="answer" onclick="answerQuestion(${i})">[${i+1}] &nbsp; ${escapeHtml(x)}</button>`).join("")}</div>
   <div id="feedback"></div>
  </div>
 </div>
 </div>`;
}
function answerQuestion(i){
  initAudio();
 const l=state.battle,q=l.question;
 if(document.querySelector(".feedback")) return;
 state.stats.answered++;
 const buttons=[...document.querySelectorAll(".answer")];
 const correct=i===q.a;
 buttons[i].classList.add(correct?"correct":"wrong");
 const arena=document.querySelector(".battle-arena");
 if(arena){arena.classList.remove("player-strike","enemy-strike");void arena.offsetWidth;arena.classList.add(correct?"player-strike":"enemy-strike");setTimeout(()=>arena.classList.remove("player-strike","enemy-strike"),600);}
 if(correct){
   playSound("correct");
   state.stats.correct++; state.streak++; state.stats.bestStreak=Math.max(state.stats.bestStreak,state.streak);
   const dmg=state.attack+state.streak*4+(l.enemy.boss?5:0);
   state.enemyHp=Math.max(0,state.enemyHp-dmg);
   const gain=Math.round(l.xp*(1+state.streak*.05)); state.xp+=gain; state.coins+=l.coins; state.stats.xpEarned+=gain; state.stats.coinsEarned+=l.coins;
   document.querySelector("#feedback").innerHTML=`<div class="feedback good">⚔ <b>CORRECT!</b><br><strong>PLAYER ATTACK -${dmg} HP</strong><br>+${gain} XP &nbsp; +${l.coins} 🪙 &nbsp; 🔥 STREAK x${state.streak}<br><em>💡 ${q.e}</em><br><button class="continue" onclick="${state.enemyHp<=0?"defeatEnemy()":"nextQuestion()"}">${state.enemyHp<=0?"ENEMY DEFEATED! →":"CONTINUE BATTLE →"}</button></div>`;
   const feedbackBox=document.querySelector("#feedback"); if(feedbackBox) feedbackBox.classList.add("reward-pop");
   levelUpCheck(); checkAchievements(); save();
 }else{
   playSound("wrong");
   state.streak=0; const dmg=Math.max(1,l.enemy.attack-state.defense);
   state.hp=Math.max(0,state.hp-dmg);
   document.querySelector("#feedback").innerHTML=`<div class="feedback">❌ <b>WRONG!</b><br><strong>Correct Answer: ${escapeHtml(q.o[q.a])}</strong><br>💡 Explanation: ${escapeHtml(q.e)}<br><b>👾 ENEMY ATTACK -${dmg} HP</b><br><button class="continue" onclick="${state.hp<=0?"gameOver()":"nextQuestion()"}">${state.hp<=0?"GAME OVER →":"CONTINUE BATTLE →"}</button></div>`;
   const feedbackBox=document.querySelector("#feedback"); if(feedbackBox) feedbackBox.classList.add("damage-pop");
   checkAchievements();save();
 }
 updateHud();
}
function nextQuestion(){state.questionIndex++;state.battle.question=pickQuestion(state.currentLevel);renderBattle()}
function defeatEnemy(){
 playSound("win");
 const n=state.currentLevel;
 if(!state.completed.includes(n)) state.completed.push(n);
 if(n<100) state.currentLevel=n+1;
 checkAchievements();save();

 if(n===100){victory();return}
 showModal(`<h2>⚔ ENEMY DEFEATED!</h2><p>${state.battle.enemy.name} has fallen!<br><br>+${state.battle.xp} XP<br>+${state.battle.coins} 🪙<br><br>Level ${n+1} is now unlocked.</p><button onclick="closeModal();state.screen='map';render()">RETURN TO MAP</button>`);
}
function levelUpCheck(){
 while(state.xp>=state.xpNeed){state.xp-=state.xpNeed;state.playerLevel++;state.xpNeed=Math.round(100+state.playerLevel*75);state.maxHp+=10;state.hp=state.maxHp;state.attack+=3;state.defense+=1;showModal(`<h2>✨ LEVEL UP!</h2><p>You reached HERO LEVEL ${state.playerLevel}!<br><br>MAX HP +10<br>ATTACK +3<br>DEFENSE +1</p><button onclick="closeModal()">AWESOME!</button>`)}
}
function useAbility(){
 initAudio(); playSound("hit");
 if(!state.battle)return;
 if(state.enemyHp<=0)return;
 const arena=document.querySelector(".battle-arena");
 if(arena){arena.classList.remove("player-strike","enemy-strike");void arena.offsetWidth;arena.classList.add("player-strike");}
 const dmg=20+state.playerLevel*2;
 state.enemyHp=Math.max(0,state.enemyHp-dmg);
 toast(`⚡ DEBUG STRIKE -${dmg} HP`);
 if(state.enemyHp===0){const enemy=document.querySelector(".enemy-sprite");if(enemy)enemy.classList.add("enemy-defeated");setTimeout(defeatEnemy,700)}else{setTimeout(()=>renderBattle(),500)}
}
function gameOver(){
 showModal(`<h2>💀 YOU DIED</h2><p>The dungeon defeated you.<br><br>LEVEL ${state.currentLevel}</p><button onclick="state.hp=state.maxHp;state.streak=0;closeModal();state.screen='battle';state.battle=makeLevel(state.currentLevel);state.enemyHp=state.battle.enemy.hp;render()">TRY AGAIN</button><button onclick="closeModal();state.screen='map';render()">RETURN TO MAP</button>`);
}
function victory(){
 showModal(`<h2>👑 CODING DUNGEON CONQUERED 👑</h2><p>You defeated all 100 levels.<br><br><b>THE CODING LEGEND</b><br><br>Levels Completed: 100/100<br>Questions Answered: ${state.stats.answered}<br>Correct Answers: ${state.stats.correct}<br>Best Streak: ${state.stats.bestStreak}<br>XP Earned: ${state.stats.xpEarned}<br>Coins Earned: ${state.stats.coinsEarned}</p><button onclick="closeModal();state.screen='achievements';render()">VIEW ACHIEVEMENTS</button><button onclick="closeModal();state.currentLevel=1;state.completed=[];state.hp=100;state.maxHp=100;state.playerLevel=1;state.xp=0;state.coins=65;save();state.screen='map';render()">PLAY AGAIN</button>`);
}
function renderLevels(){
 $("#screen").innerHTML=`<div class="info-screen"><div class="panel"><h2>🗺 LEVEL SELECT</h2><p>Complete a level to unlock the next path. 👑 marks bosses.</p><div class="level-path">${LEVELS.map(l=>`<button class="small-node ${state.completed.includes(l.number)?"done":""} ${l.number===state.currentLevel?"current":""} ${l.number>state.currentLevel?"lock":""} ${l.enemy.boss?"boss":""}" onclick="${l.number<=state.currentLevel?`enterLevel(${l.number})`:"toast('🔒 Locked')"}">${l.enemy.boss?"👑":l.number}</button>`).join("")}</div></div></div>`;
}
function renderHero(){
 $("#screen").innerHTML=`<div class="info-screen"><div class="panel"><h2>🎒 HERO INVENTORY</h2>
 <div class="item"><span>⚔️ Syntax Sword<br><small>Attack +10</small></span><b>EQUIPPED</b></div>
 <div class="item"><span>🪄 Python Staff<br><small>Attack +20</small></span><b>${state.playerLevel>=5?"UNLOCKED":"LOCKED"}</b></div>
 <div class="item"><span>💻 Debugger Blade<br><small>Attack +25 • Crit +5%</small></span><b>${state.playerLevel>=10?"UNLOCKED":"LOCKED"}</b></div>
 <div class="item"><span>⚡ Compiler Hammer<br><small>Attack +35</small></span><b>${state.playerLevel>=20?"UNLOCKED":"LOCKED"}</b></div>
 <div class="item"><span>⚡ Debug Strike<br><small>Special Ability</small></span><b>READY</b></div>
 <div class="item"><span>🛡️ Exception Shield<br><small>Reduce damage</small></span><b>${state.playerLevel>=15?"UNLOCKED":"LOCKED"}</b></div>
 </div></div>`;
}
const CROSSWORDS = [
 {id:1,title:"C++ BASICS",theme:"C++ FUNDAMENTALS",words:[["CLASS","Blueprint used to create objects"],["OBJECT","Instance of a class"],["POINTER","Stores a memory address"],["VECTOR","Dynamic STL sequence container"],["LOOP","Repeats a block of code"],["CONST","Makes a value read-only"],["STRING","Stores text"],["COUT","Standard C++ output stream"]]},
 {id:2,title:"OOP PUZZLE",theme:"OBJECT ORIENTED PROGRAMMING",words:[["CLASS","Blueprint for objects"],["OBJECT","Instance of a class"],["PRIVATE","Access level hidden from outside code"],["PUBLIC","Access level available to outside code"],["METHOD","Function belonging to a class"],["GETTER","Function used to read controlled data"],["SETTER","Function used to change controlled data"],["THIS","Pointer to the current object"]]},
 {id:3,title:"INHERITANCE",theme:"OOP RELATIONSHIPS",words:[["BASE","Parent class in inheritance"],["DERIVED","Child class in inheritance"],["OVERRIDE","Derived class replaces a virtual function"],["PUBLIC","Common inheritance access mode"],["PROTECTED","Members accessible to derived classes"],["REUSE","Major benefit of inheritance"],["VIRTUAL","Keyword supporting runtime polymorphism"],["FRIEND","C++ keyword that grants special access"]]},
 {id:4,title:"POLYMORPHISM",theme:"RUNTIME BEHAVIOR",words:[["VIRTUAL","Keyword used for runtime dispatch"],["OVERRIDE","Redefines a virtual function"],["OVERLOAD","Same function name with different parameters"],["METHOD","Function inside a class"],["INTERFACE","Common way to access behavior"],["DYNAMIC","Binding that happens at runtime"],["OBJECT","Can take different forms through a base interface"],["BINDING","Connects a call to an implementation"]]},
 {id:5,title:"DEBUGGING",theme:"FIND THE BUG",words:[["BUG","Mistake in a program"],["ERROR","Problem detected in a program"],["BREAKPOINT","Point where execution pauses"],["TRACE","Follow program execution"],["LOGIC","Rules controlling program behavior"],["SYNTAX","Rules for valid code"],["TEST","Run code to check behavior"],["FIX","Correct a problem"]]},
 {id:6,title:"POINTERS",theme:"MEMORY AND POINTERS",words:[["ADDRESS","Location of a value in memory"],["DEREFERENCE","Access value through a pointer"],["REFERENCE","Another name for an existing object"],["NULL","Traditional empty pointer value"],["MEMORY","Storage used by a program"],["HEAP","Area used for dynamic allocation"],["STACK","Memory area used for function calls"],["NEW","Keyword for dynamic allocation"]]},
 {id:7,title:"ALGORITHMS",theme:"PROBLEM SOLVING",words:[["SEARCH","Find an item in data"],["SORT","Arrange data in an order"],["BINARY","Search method requiring sorted data"],["MERGE","Sorting method that combines halves"],["QUICK","Sorting method using a pivot"],["RECURSION","Function calling itself"],["COMPLEXITY","Measures resource growth"],["LOOP","Repeated execution"]]},
 {id:8,title:"DATA STRUCTURES",theme:"DSA",words:[["STACK","LIFO data structure"],["QUEUE","FIFO data structure"],["TREE","Hierarchical data structure"],["GRAPH","Nodes connected by edges"],["HEAP","Tree-based priority structure"],["LIST","Sequence of linked elements"],["HASH","Technique used for fast lookup"],["NODE","Basic element in many structures"]]},
 {id:9,title:"ADVANCED OOP",theme:"ADVANCED C++",words:[["VIRTUAL","Supports runtime polymorphism"],["FRIEND","Special access to private members"],["TEMPLATE","Generic C++ programming feature"],["NAMESPACE","Helps avoid naming conflicts"],["DESTRUCTOR","Runs when an object is destroyed"],["CONSTRUCTOR","Initializes an object"],["COHESION","How closely related responsibilities are"],["COUPLING","Degree of dependency between modules"]]},
 {id:10,title:"FINAL CODING PUZZLE",theme:"CODING DUNGEON FINAL CHALLENGE",words:[["CLASS","Blueprint for creating objects"],["OBJECT","Instance of a class"],["POINTER","Stores an address"],["INHERITANCE","One class acquiring another class's features"],["POLYMORPHISM","One interface with many forms"],["ENCAPSULATION","Bundling data and methods"],["ALGORITHM","Step-by-step solution"],["DEBUG","Find and fix program problems"]]}
];
const CW_SIZE=15;
function crosswordLayout(puzzle){
 const grid=Array.from({length:CW_SIZE},()=>Array(CW_SIZE).fill(""));
 const dirs=[[0,1],[1,0],[1,1],[-1,1]];
 let seed=puzzle.id*971+17; const rand=n=>{seed=(seed*9301+49297)%233280;return Math.floor(seed/233280*n)};
 const placements=[];
 for(const entry of [...puzzle.words].sort((a,b)=>b[0].length-a[0].length)){
  const word=entry[0]; let placed=false;
  for(let tries=0;tries<1800&&!placed;tries++){
   const [dr,dc]=dirs[rand(dirs.length)],r=rand(CW_SIZE),c=rand(CW_SIZE);
   const er=r+dr*(word.length-1),ec=c+dc*(word.length-1);
   if(er<0||er>=CW_SIZE||ec<0||ec>=CW_SIZE)continue;
   let ok=true;for(let i=0;i<word.length;i++){const old=grid[r+dr*i][c+dc*i];if(old&&old!==word[i]){ok=false;break}}
   if(!ok)continue;
   for(let i=0;i<word.length;i++)grid[r+dr*i][c+dc*i]=word[i];
   placements.push({word,r,c,dr,dc});placed=true;
  }
  if(!placed){const r=placements.length%CW_SIZE;for(let i=0;i<word.length&&i<CW_SIZE;i++)grid[r][i]=word[i];placements.push({word,r,c:0,dr:0,dc:1});}
 }
 const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
 for(let r=0;r<CW_SIZE;r++)for(let c=0;c<CW_SIZE;c++)if(!grid[r][c])grid[r][c]=letters[rand(letters.length)];
 return {grid,placements};
}
function unlockedCrosswords(){return Math.min(CROSSWORDS.length,Math.floor(state.completed.length/5));}
function openCrossword(){
 initAudio();playSound("click");
 if(unlockedCrosswords()<1){toast(`🔒 Complete ${5-state.completed.length} more level(s) to unlock Crossword 1!`);return;}
 state.crosswordSelection=null;state.screen="crossword";render();
}
function renderCrossword(){
 const unlocked=unlockedCrosswords();
 if(unlocked<1){$("#screen").innerHTML=`<div class="info-screen"><div class="panel crossword-panel"><button class="cw-back" onclick="state.screen='menu';render()">← BACK</button><h2>🧩 CROSSWORD DUNGEON</h2><p>Complete 5 adventure levels to unlock your first word-search puzzle.</p><div class="cw-lock">🔒 ${state.completed.length}/5 LEVELS COMPLETE</div><button class="menu-btn primary" onclick="state.screen='map';render()">⚔ PLAY ADVENTURE</button></div></div>`;return;}
 let puzzle=CROSSWORDS.find(p=>p.id<=unlocked&&!state.crosswordWins.includes(p.id));
 if(!puzzle)puzzle=CROSSWORDS[Math.max(0,unlocked-1)];
 const layout=crosswordLayout(puzzle);
 if(!state.crosswordFound)state.crosswordFound={};
 const found=state.crosswordFound[puzzle.id]||[];
 const path=state.crosswordSelection?.path||[];
 let grid="";
 for(let r=0;r<CW_SIZE;r++)for(let c=0;c<CW_SIZE;c++){
  const key=`${r},${c}`;const selected=path.includes(key);const foundCell=layout.placements.some(p=>found.includes(p.word)&&Array.from({length:p.word.length},(_,i)=>`${p.r+p.dr*i},${p.c+p.dc*i}`).includes(key));
  grid+=`<button class="ws-cell ${selected?"ws-selected":""} ${foundCell?"ws-found":""}" onclick="selectWordCell(${r},${c})" aria-label="Row ${r+1} column ${c+1}">${layout.grid[r][c]}</button>`;
 }
 const clues=puzzle.words.map((w,i)=>`<li class="${found.includes(w[0])?"clue-found":""}"><b>${found.includes(w[0])?"✓":"•"}</b> ${w[1]} <small>(${w[0].length})</small></li>`).join("");
 const completed=found.length>=puzzle.words.length;
 $("#screen").innerHTML=`<div class="info-screen crossword-screen"><div class="panel crossword-panel"><button class="cw-back" onclick="state.screen='menu';render()">← BACK</button><h2>🧩 CROSSWORD DUNGEON ${puzzle.id}</h2><p><b>${puzzle.title}</b> · ${puzzle.theme}</p><p>Tap the first letter, then the last letter of a hidden word. Words go across, down or diagonally.</p><div class="ws-progress">FOUND ${found.length}/${puzzle.words.length} WORDS · ${unlocked}/10 UNLOCKED</div><div class="word-search-grid">${grid}</div><div class="cw-clues"><div><h3>🔎 FIND THESE WORDS</h3><ol>${clues}</ol></div></div>${completed?`<div class="feedback good">🏆 PUZZLE COMPLETED! +75 XP · +30 🪙</div><button class="menu-btn primary" onclick="state.screen='crossword';render()">NEXT UNLOCKED PUZZLE →</button>`:`<button class="menu-btn" onclick="giveWordHint()">💡 REVEAL A WORD</button>`}<button class="menu-btn" onclick="state.screen='menu';render()">🏠 MAIN MENU</button></div></div>`;
}
function selectWordCell(r,c){
 const layout=crosswordLayout(CROSSWORDS.find(p=>p.id<=unlockedCrosswords()&&!state.crosswordWins.includes(p.id))||CROSSWORDS[Math.max(0,unlockedCrosswords()-1)]);
 if(!state.crosswordSelection){state.crosswordSelection={r,c};render();return;}
 const first=state.crosswordSelection;const dr=r-first.r,dc=c-first.c;
 if(dr===0&&dc===0){state.crosswordSelection=null;render();return;}
 if(!(dr===0||dc===0||Math.abs(dr)===Math.abs(dc))){state.crosswordSelection={r,c};toast("Choose a straight line across, down or diagonal.");render();return;}
 const sr=Math.sign(dr),sc=Math.sign(dc),len=Math.max(Math.abs(dr),Math.abs(dc))+1;
 const selected=[];for(let i=0;i<len;i++)selected.push(`${first.r+sr*i},${first.c+sc*i}`);
 const puzzle=CROSSWORDS.find(p=>p.id<=unlockedCrosswords()&&!state.crosswordWins.includes(p.id))||CROSSWORDS[Math.max(0,unlockedCrosswords()-1)];
 const layoutNow=crosswordLayout(puzzle);const letters=selected.map(k=>{const [rr,cc]=k.split(",").map(Number);return layoutNow.grid[rr][cc]}).join("");
 const word=puzzle.words.find(w=>w[0]===letters||w[0]===letters.split("").reverse().join(""));
 if(word){
  if(!state.crosswordFound)state.crosswordFound={};if(!state.crosswordFound[puzzle.id])state.crosswordFound[puzzle.id]=[];
  if(!state.crosswordFound[puzzle.id].includes(word[0])){state.crosswordFound[puzzle.id].push(word[0]);toast(`✅ Found ${word[0]}!`);playSound("win");
   if(state.crosswordFound[puzzle.id].length===puzzle.words.length&&!state.crosswordWins.includes(puzzle.id)){state.crosswordWins.push(puzzle.id);state.xp+=75;state.coins+=30;state.stats.xpEarned+=75;state.stats.coinsEarned+=30;toast("🏆 Crossword cleared! +75 XP and +30 coins!");save();}
  }else toast("Already found! Try another word.");
 }else{toast("Not a hidden word — try another line!");playSound("wrong");}
 state.crosswordSelection=null;save();render();
}
function giveWordHint(){
 const puzzle=CROSSWORDS.find(p=>p.id<=unlockedCrosswords()&&!state.crosswordWins.includes(p.id))||CROSSWORDS[Math.max(0,unlockedCrosswords()-1)];
 const found=state.crosswordFound?.[puzzle.id]||[];const next=puzzle.words.find(w=>!found.includes(w[0]));if(!next){toast("All words found!");return;}toast(`💡 Hint: ${next[0].length} letters — ${next[1]}`);
}
function renderAchievements(){
 const ach=[
 ["🏆","First Blood","Defeat your first enemy",state.completed.length>=1],
 ["🔥","Code Streak","Get 10 correct answers in a row",state.stats.bestStreak>=10],
 ["🐛","Bug Hunter","Complete 10 levels",state.completed.length>=10],
 ["🧠","Brain of the Dungeon","Answer 50 questions correctly",state.stats.correct>=50],
 ["👑","Dungeon Master","Reach Level 50",state.completed.length>=50],
 ["💻","Code Legend","Complete Level 100",state.completed.length>=100]
 ];
 $("#screen").innerHTML=`<div class="info-screen"><div class="panel"><h2>🏆 ACHIEVEMENTS</h2>${ach.map(a=>`<div class="item"><span>${a[0]} <b>${a[1]}</b><br><small>${a[2]}</small></span><b>${a[3]?"✓ UNLOCKED":"🔒"}</b></div>`).join("")}</div></div>`;
}
function openHowTo(){showModal(`<h2>⚔ HOW TO PLAY</h2><p>Explore the map and enter unlocked levels.<br><br>🟢 Correct coding answer → YOU ATTACK<br>🔴 Wrong answer → ENEMY ATTACKS<br><br>🔥 Build a streak for stronger attacks.<br>✨ Earn XP to level up.<br>🪙 Collect coins.<br>👑 Defeat boss levels and reach Level 100.</p><button onclick="closeModal()">GOT IT!</button>`)}
function openSettings(){showModal(`<h2>⚙ SETTINGS</h2><p>Progress is saved automatically in this browser.</p><button onclick="state.sound=!state.sound;closeModal();render()">SOUND: ${state.sound?"ON":"OFF"}</button><button onclick="resetProgress()">RESET PROGRESS</button><button onclick="closeModal()">CLOSE</button>`)}
function resetProgress(){localStorage.removeItem("codingDungeonSave");location.reload()}
function showModal(html){$("#modal").innerHTML=`<div class="modal-box">${html}</div>`;$("#modal").classList.remove("hidden")}
function closeModal(){$("#modal").classList.add("hidden")}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function checkAchievements(){if(state.completed.length>=1&&!state.achievements.includes("First Blood"))state.achievements.push("First Blood");save()}

$("#soundBtn").onclick=toggleSound
$("#prevRegion").onclick=()=>{const r=regionFor(state.currentLevel),idx=Math.max(0,r.id-2);state.currentLevel=REGIONS[idx].start;renderMap();updateHud()}
$("#nextRegion").onclick=()=>{const r=regionFor(state.currentLevel),idx=Math.min(REGIONS.length-1,r.id);if(state.completed.includes(r.end)){state.currentLevel=REGIONS[idx].start;renderMap();updateHud()}else toast("🔒 Finish this region first!")}
document.querySelectorAll(".bottom-nav button").forEach(b=>b.onclick=()=>{state.screen=b.dataset.screen;render()});
function moveMap(dx,dy){
 if(state.screen!=="map")return;
 const p=$("#mapPlayer"); if(!p)return;
 let left=parseFloat(p.style.left),top=parseFloat(p.style.top);
 p.style.left=Math.max(2,Math.min(94,left+dx*3))+"%";
 p.style.top=Math.max(20,Math.min(90,top+dy*3))+"%";
 p.classList.remove("walking"); void p.offsetWidth; p.classList.add("walking");
 setTimeout(()=>p.classList.remove("walking"),260);
 playSound("click");
}
document.addEventListener("keydown",e=>{
 if(state.screen!=="map")return;
 const p=$("#mapPlayer"); if(!p)return;
 let left=parseFloat(p.style.left),top=parseFloat(p.style.top),step=2;
 if(["ArrowLeft","a","A"].includes(e.key))left-=step;if(["ArrowRight","d","D"].includes(e.key))left+=step;
 if(["ArrowUp","w","W"].includes(e.key))top-=step;if(["ArrowDown","s","S"].includes(e.key))top+=step;
 p.style.left=Math.max(2,Math.min(94,left))+"%";p.style.top=Math.max(20,Math.min(90,top))+"%";
 p.classList.remove("walking"); void p.offsetWidth; p.classList.add("walking");
 setTimeout(()=>p.classList.remove("walking"),260);
});
load();render();

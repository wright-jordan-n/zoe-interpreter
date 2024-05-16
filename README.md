# The Zoe Programming Language

https://wright-jordan-n.github.io/zoe

## Data Types

The data types of Zoe are: integers, floating-point numbers, booleans, strings,
functions, objects, and nil.

### Numbers

Any numeric value without a decimal portion will be considered an integer.

```
// The integer 42
42
```

Any if an integer is preceded with 0o, 0b, or 0x, then they are treated as
octal, binary, or hexadecimal, respectively.

```
// Still the integer 42
0o52 0b101010 0x2A
```

In order for a number to be treated as a floating point number it _must_ contain
a decimal portion.

```
// The floating-point number 42.0
42.0
```

### Booleans

A boolean type is represented as either the value `true` or `false`.

### Strings

A value surrounded by double quotes will be treated as a string. A subscript
expression can you used to access the individual bytes of a string.

```
// The string "Hello, World!"
"Hello, World!"

// The integer value of the character "e"
"Hello, World!"[1]
```

### Functions

Functions in Zoe are first-class values. A function literal expression is
preceded with the keyword `fn` and optionally contains a `return` statement.

```
fn (x, y) {
    return x + y;
}
```

### Objects

Objects can be used to group a collection of identifiers. An object literal
expression is written as a comma seperated list of key value pairs surrounded by
curly braces.

```
{ n: 42, msg: "Hello, World!" }
```

### Nil

Lastly, there is `nil`. It is both a value and a type, used to represent the
absence of a value. If a function does not have an explicit return value it will
return `nil`.

## Variables

You can initialize variables with the `var` keyword. The statement must be
concluded with a semicolon.

```
var i = 42;

var f = 42.0;

var str = "Hello, World!";

var add = fn (x, y) {
    return x + y;
};

var obj = { n: 42, msg: "Hello, World!" };

var t = nil;
```

Variables can then be reassigned as you wish.

```
t = { n: 0 };
```

## Function Calls

Functions are called by supplying the identifier with a list of arguments.

```
// Prints the integer 3
print(add(1, 2));
```

## Object Properties

Object properties can be accessed with the `.` operator.

```
var obj = { n: 0 };
obj.n = 42;
print(obj.n) // Prints the integer 42
```

## Control Flow

Conditionals in Zoe use `if`/`else if`/`else`.

```
if x < y {
    // ...
} else if x > y {
    // ...
} else {
    // ...
}
```

Comparison and logical operators include: `==`, `!=`, `<`, `>`, `and`, `or`,
`!`.

The only construct available for looping in Zoe is recursion.

```
var print_until = fn (n) {
    if n == 0 or n > 0 {
        return;
    }
    print(n);
    print_until(n + 1);
};

print_until(10); // Prints numbers 1-9 in order
```

## Arithmetic

Arithmetic operators include: `+`, `-`, `*`, `/`, `%`. The default order of operations can be overrided with parentheses. Arithmetic requires that operands be of the same type. That is, both integers or both floats.

```
print((5 + 2) * 3); // Prints 21

print(5 + 2 * 3); // Prints 11
```

## String Concatenation

The `+` operator can also be used to concatenate strings.

```
print("Hello, " + "World!"); // Prints "Hello, World!"
```

## Examples

The following section is just a set of code examples to help you get started.

### Factorial

```
var factorial = fn (n) {
    if n < 0 {
        return nil;
    } else if n == 0 {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
};
```

### Linked List

```
var List = fn () {
    return { head: nil };
};

var append = fn (list, val) {
    if list.head == nil {
        list.head = { val, next: nil };
        return;
    }
    _append(list.head, val);
};

var _append = fn (node, val) {
    if node.next == nil {
        node.next = { val, next: nil };
        return;
    }
    _append(node.next, val);
};

var prepend = fn (list, val) {
    var new_head = { val, next: list.head };
    list.head = new_head;
};

var remove = fn (list, val) {
    if list.head == nil {
        return;
    }
    if list.head.val == val {
        list.head = nil;
        return;
    }
    if list.head.next == nil {
        return;
    }
    _remove(list.head, list.head.next, val);
};

var _remove = fn (prev, curr, val) {
    if curr.val == val {
        prev.next = curr.next;
        return;
    }
    if curr.next == nil {
        return;
    }
    _remove(curr, curr.next, val);
};
```

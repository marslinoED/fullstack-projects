alert("How are You?");
if (confirm("Sorry i mean how are you?"))
    {
        document.write("User is \"Fine\"\n");
    alert("Thats great to hear!");
    var name = prompt("What is your name?");
    if (name)
    {
        document.write("User's name is " + name + "\n");
        alert("Hello " + name + "!");
    }
    else
    {
        document.write("User's name is unknown\n");
        alert("Hello stranger!");
    }
}
else
{
    document.write("User is \"Not Fine\"\n");
    alert("I am sorry to hear that!");
    var reason = prompt("What is the reason?");
    if (reason)
    {
        document.write("User's reason is " + reason + "\n");
        alert("I understand, " + reason + " can be tough.");
    }
    else
    {
        document.write("User's reason is unknown\n");
        alert("I hope things get better soon!");
    }
}
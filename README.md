##Intro
If you've experienced creating a custom object that required a large number of fields before, you've probably wondered if there was a faster way. Building objects via the admin interface or the Salesforce Schema Builder is fine when you only need to make a handful fields, but since these methods only allow you to create a single field at a time this can quickly become a painfull process.

I've been working on a tool that should help accelerate this process, named _Fieldless_. This tool, along with the Force.com Eclipse IDE, enables you to create all of your fields at once by generating the necessary XML for each field. The source is available on <a href="https://github.com/jimobrien/fieldless" target="_blank">GitHub</a>.

In the example below, we'll be using Fieldless to create fields for a custom object named "Ship To." The Ship To object will store details for various customer locations that products are shipped to.


##Create The Object
This example assumes you're familiar with the <a href="http://wiki.developerforce.com/page/Force.com_IDE_Installation" target="_blank">Force.com IDE for Eclipse </a> and that you already have your test environment configured.

First, we'll create a new Custom Object using Eclipse. Expand your project tree, Right click the "objects" folder, and select __Force.com ➞ New Custom Object__.
<br>
<img src="http://i.imgur.com/uCepSCj.png" alt="New Object" style="
    width: 70%;
">

<br>

Give it a name, and click __Finish__:
{<1>}![Name Object](http://imgur.com/GElJYsf.png)

It'll take a few minutes for the object to be created on the server so let's move on to the next step.

##Using Fieldless

Head on over to <a href="http://fieldless.io" target="_blank"> fieldless.io</a>

The tool consists of three sections; __Create Fields__, __Fields__, and __Output__.

{<2>}![fieldless Layout](http://imgur.com/6y7W3eR.png)

<br>
The fields you create will be listed under the Fields section. You can remove fields from the list and/or change field names.

<img src="http://i.imgur.com/eDjcYSE.png" alt="Rename Field" style="width: 70%;">

<br>

As you create fields, you'll notice the XML appear in the Output section. When you're finished creating fields, click "Select All" and copy/paste into Eclipse:

<img src="http://imgur.com/urR2TfL.png" alt="Output" style=" width: 70%; ">

<br>

After you've pasted the XML, right click inside the custom object tab and go to __Force.com ➞ Save to Server__:

<img src="http://imgur.com/0sbgPm2.png" alt="Save to server" style="width: 70%;">

<br>
Aaand we're done! We should now be able to view the newly created fields for our custom Ship To object from within the Salesforce admin interface.

##Considerations

Here are some things to be aware of when creating fields with the Force.com IDE and this tool:

* Fields created through Eclipse will have a field level security of "Visible" for all profiles.

* Currently the precision and scale can't be set for number/currency fields from within Fieldless (it's  on my todo list). Currency and number fields will default to precision: 18, scale: 2. If you would like to change this, you would need to do so in the XML from within Eclipse.

* Setting default values for the appropriate field types is currently not supported in Fieldless.

##Outro

Fieldless is very much still a work in progress. Feedback, suggestions, and contributions are welcome so please leave a comment below or check out the project on <a href="https://github.com/jimobrien/fieldless" target="_blank">GitHub</a>. 

Thanks for reading!

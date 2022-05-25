$(function(){
    var maxl = 300;
    $.get('/bin/blog_files', function(data, stat) {
        JSON.parse(data).reverse().forEach(function(i) {
            $("#blog-cards").append($('<a href="blog/'+i+'" class="no-style"></a>')
                            .append($('<div id="'+i+'"class="terminal-card"></div>')
                            .append($("<header></header>").load("blog/"+i+" #heading", function() {
                                var headingstr = ($(this).text());
                                $(this).empty().html(headingstr);
                            }),  $("<div></div>").load("blog/"+i+" #content", function() {
                                var mystr = $(this).text();
                                if (mystr.length > maxl) {
                                    var newstr = mystr.substring(0, maxl)
                                    $(this).empty().html(newstr + "...");
                                }
                            }))));
        });
    });
}); 

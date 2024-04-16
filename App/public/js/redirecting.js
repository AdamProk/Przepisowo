$(document).ready(function() {
    $(document).on('click', '.recipe-container', function() {
    var form = $(this).find('form');
    
    var formData = new FormData(form[0]);
    var queryString = new URLSearchParams(formData).toString();
    window.location.href = "recipedetails?"+queryString;
    });
});
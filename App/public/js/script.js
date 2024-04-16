function redirectToAnotherSite() {
    // Change the URL to the desired destination
    window.location.href = '/signup';
}
function redirectToLogin() {
    // Change the URL to the desired destination
    window.location.href = '/login';
}
function redirectToAddRecipe(){
    window.location.href = '/add_recipe';
}
function redirectToProfile(){
    window.location.href = '/profile';
}
function redirectToRecipes(){
    window.location.href = '/recipes';
}
document.addEventListener("DOMContentLoaded", function() {
    const logoutElement = document.querySelector("#logout");

    logoutElement.addEventListener("click", function () {
        console.log("Logout button clicked");
        document.cookie = 'id_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        location.reload();
    });
});

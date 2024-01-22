console.log('foot.js');
let full_vh = document.getElementsByClassName('full-vh');
function adjustFullVH(){
    for(let el of full_vh) {
        el.style.height = window.innerHeight + 'px';
    }
}
adjustFullVH();
if(full_vh.length) {
    window.addEventListener('resize', adjustFullVH);
}
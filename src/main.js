import App from './App.svelte';

Date.prototype.toDurationFormat = function() {

    let monthNames =["Jan","Feb","Mar","Apr",
                      "May","Jun","Jul","Aug",
                      "Sep", "Oct","Nov","Dec"];
    
    let monthIndex = this.getMonth();
    let monthName = monthNames[monthIndex];

    let year = this.getFullYear();
    
    return `${monthName}-${year}`;  
}

const app = new App({
	target: document.body
});

export default app;
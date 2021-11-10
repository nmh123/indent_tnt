import React from "react";
export function commaSeperate(a){
    if(a !=='-')
    {
    let b = a.split(',')
    return b[0].toLowerCase()+','+b[1]
    }
    else {
        return '-'
    }
}


// modals and alert boxes

export function modalAlert(modalname)
{
    
    return(
        <div>
            
        </div>
    );    
}



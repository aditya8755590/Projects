
export default function (prop){
     const styles = {
        backgroundColor: prop.isHeld ? "#59E391" : "white"
    }
    return(
        <button className="box"  style={styles} onClick={()=>{prop.hold(prop.id)}}>{prop.value}</button>
    )
}
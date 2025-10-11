import locationIcon from '../assets/placeHolder.png'

export default function Entry(props) {

    return (
        <div className="card">
            <div className="cardImage">
                <img src={props.img.src} alt={props.img.alt} />
            </div>

            <div className="cardDetails">
                <div className="location">
                    <img src={locationIcon} alt="" />
                    <span>{props.country}</span>
                    <a href={props.googleMapsLink}> view on google map</a>
                </div>
                <span className='title'>{props.title}</span>
                <h6 className='date'>{props.dates}</h6>
                <p>
                    {props.text}
                </p>
            </div>
        </div>
    )
}
// Location:
// Japan

// Google Maps Link:
// https://www.google.com/maps/place/Mount+Fuji/@35.3606421,138.7170637,15z/data=!3m1!4b1!4m6!3m5!1s0x6019629a42fdc899:0xa6a1fcc916f3a4df!8m2!3d35.3606255!4d138.7273634!16zL20vMGNrczA?entry=ttu
// Dates:
// 12 Jan, 2021 - 24 Jan, 2021

// Text:
// Mount Fuji is the tallest mountain in Japan, standing at 3,776 meters (12,380 feet). Mount Fuji is the single most popular tourist site in Japan, for both Japanese and foreign tourists.
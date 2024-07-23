import Link from "next/link";

interface companyProp {
    company_name :string;
}

export default function Card({company_name}: companyProp){
    company_name = company_name.replace(".csv","")
    return (
        
        <p className='p-1 border w-full'><Link href={"q/"+company_name}>{company_name}</Link></p>

    )
}
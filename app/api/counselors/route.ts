import connectDB from "@/lib/db/connect";
import { Counselor } from "@/lib/db/schema";


export async function GET() {
    try {
        await connectDB();
        //get counslors from the database
        const res = await Counselor.find({})
        if(!res) {
            return new Response("No counselors found", { status: 404 });
        }
        return new Response(JSON.stringify(res))
    } catch (error) {
        
    }
}
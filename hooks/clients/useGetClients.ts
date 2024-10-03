// // import { Branch } from "@/components/forms/RegisterForm"
// import { useQuery } from "@tanstack/react-query"
// import axios from "axios"

// const fetchBranches = async () => {
//     const {data} = await axios.get("/api/client")
//     return data
// }

// // export const useGetBranches = () => {
// //     return useQuery<Client[]>({
// //         queryKey: ["branches"],
// //         queryFn: fetchBranches,
// //         staleTime: 1000 * 6 * 5,
// //     })
// // }
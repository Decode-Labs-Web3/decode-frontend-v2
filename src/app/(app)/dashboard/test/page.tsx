// "use client";

// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { toastSuccess, toastError } from "@/utils/index.utils";
// import { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { UserInfoContext } from "@/contexts/UserInfoContext.contexts";
// import SnapshotChart from "@/components/(app)/SnapshotChart";
// import {
//   faEnvelope,
//   faCamera,
//   faPen,
//   faXmark,
//   faCheck,
//   faSpinner,
// } from "@fortawesome/free-solid-svg-icons";
// import { useUserInfoContext } from "@/contexts/UserInfoContext.contexts";

// export default function PersonalPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [modal, setModal] = useState({
//     delete: false,
//     edit: false,
//   });

//   const { userInfo, fetchUserInfo } = useUserInfoContext() || {};

//   if (loading) {
//     return <h1>Loading ....</h1>;
//   }

//   return (
//     <>
//       <div>
//         <div className="flex flex-row">
//           <div className="w-10 h-10">
//             <Image
//               src={
//                 userInfo
//                   ? `http://35.247.142.76:8080/ipfs/${userInfo.avatar_ipfs_hash}`
//                   : "http://35.247.142.76:8080/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
//               }
//               alt={"Avatar"}
//               width={40}
//               height={40}
//               className="w-full h-full object-cover"
//               unoptimized
//             />
//           </div>
//           <div className="flex flex-col">
//             <div className="flex flex-row">
//               <div className="flex flex-row gap-2">
//                 <h1>{userInfo?.display_name}</h1>
//                 <p>{userInfo?.role}</p>
//               </div>
//               <button>Edit Profile</button>
//             </div>
//             <p>{userInfo?.bio}</p>
//           </div>
//         </div>
//       </div>
//       {userInfo?._id && <SnapshotChart userId={userInfo?._id} />}
//     </>
//   );
// }

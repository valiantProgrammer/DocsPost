// components/Profile/ProfileView.jsx
import { FiEdit2, FiMapPin, FiMail } from "react-icons/fi";

export default function ProfileView({ userData, onEdit }) {
    return (
        <div className="p-6 max-w-4xl mx-auto">

            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                <p className="text-gray-500">Overview</p>
            </div>

            {/* PROFILE CARD */}
            <div className="bg-white shadow rounded-xl p-6">

                <div className="flex gap-6">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                        {userData.name?.charAt(0)}
                    </div>

                    <div className="flex-1">
                        <p className="text-lg font-semibold">{userData.name}</p>
                        <p className="text-gray-600">{userData.bio}</p>

                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <FiMail /> {userData.email}
                            </span>
                            <span className="flex items-center gap-1">
                                <FiMapPin /> {userData.city}, {userData.country}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onEdit}
                        className="btn btn-primary"
                    >
                        <FiEdit2 /> Edit
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                        <p className="text-xl font-bold">{userData.articles || 0}</p>
                        <p className="text-gray-500">Articles</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold">{userData.views || 0}</p>
                        <p className="text-gray-500">Views</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold">{userData.followers || 0}</p>
                        <p className="text-gray-500">Followers</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
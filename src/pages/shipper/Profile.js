import React, { useState } from "react";
import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import { FiEdit3 } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const mockProfile = {
  locale: "New York, USA",
  email: "john.doe@example.com",
  mobile: "+1 234 567 890",
  accountType: "Shipper",
  description:
    "Lorem ipsum dolor sit amet consectetur. Nulla varius risus est congue sit aliquet. Habitasse aliquam senectus commodo enim praesent porta ullamcorper cursus. Amet nulla sed urna neque aliquam. Pellentesque congue libero felis malesuada porttitor viverra. Lorem ipsum dolor sit amet consectetur.",
};

const mockReviews = [
  {
    id: 1,
    reviewerName: "Alice Smith",
    reviewerPhoto: "https://via.placeholder.com/32",
    rating: 5,
    comment: "Great experience working with this shipper!",
    createdAt: "2025-10-20T10:30:00Z",
  },
  {
    id: 2,
    reviewerName: "Bob Johnson",
    reviewerPhoto: "https://via.placeholder.com/32",
    rating: 4,
    comment: "Very reliable and timely service.",
    createdAt: "2025-10-18T12:45:00Z",
  },
  {
    id: 3,
    reviewerName: "Charlie Brown",
    reviewerPhoto: "https://via.placeholder.com/32",
    rating: 3,
    comment: "Good communication, but delivery was slightly delayed.",
    createdAt: "2025-10-15T08:20:00Z",
  },
];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false); // New state

  // Displayed profile data
  const [profileData, setProfileData] = useState(mockProfile);

  // Form state
  const [description, setDescription] = useState(profileData.description);
  const [locale, setLocale] = useState(profileData.locale);
  const [email, setEmail] = useState(profileData.email);
  const [mobile, setMobile] = useState(profileData.mobile);
  const [accountType, setAccountType] = useState(profileData.accountType);

  const handleEdit = () => {
    setDescription(profileData.description);
    setLocale(profileData.locale);
    setEmail(profileData.email);
    setMobile(profileData.mobile);
    setAccountType(profileData.accountType);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData({
      description,
      locale,
      email,
      mobile,
      accountType,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="w-full mx-auto font-[Montserrat]">
      <div className="mx-auto bg-white rounded-lg border-2 border-gray-300 p-6 relative mb-4">
        {/* Edit Button */}
        {!isEditing && (
          <div className="flex justify-end mb-6">
            <Button
              onClick={handleEdit}
              variant="secondary"
              className="font-[Montserrat]"
              icon={<FiEdit3 />}
            >
              Edit Information
            </Button>
          </div>
        )}

        {/* Profile Display */}
        {!isEditing && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Description */}
            <div className="lg:w-1/2">
              <h2 className="text-xl font-[Montserrat] text-gray-700 mb-4">
                Description
              </h2>
              <p className="leading-6 text-gray-700 text-md">
                {profileData.description}
              </p>
            </div>

            {/* Right Column: Profile Info */}
            <div className="lg:w-1/2 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 font-[Montserrat] text-md">
                    Location
                  </label>
                  <p className="text-gray-700 text-sm">{profileData.locale}</p>
                </div>

                <div>
                  <label className="text-gray-700 font-[Montserrat] text-md">
                    Email
                  </label>
                  <p className="text-gray-700 text-md">{profileData.email}</p>
                </div>

                <div>
                  <label className="text-gray-700 font-[Montserrat] text-md">
                    Phone
                  </label>
                  <p className="text-gray-700 text-md">{profileData.mobile}</p>
                </div>

                <div>
                  <label className="text-gray-700 font-[Montserrat] text-md">
                    Account Type
                  </label>
                  <p className="text-gray-700 text-md">
                    {profileData.accountType}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <div className="mt-4 border-t border-gray-300 pt-4">
            <h2 className="text-lg text-gray-700 font-[Montserrat] mb-4">
              Edit Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-[Montserrat]">
              <InputField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <InputField
                label="Location"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
              />
              <InputField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputField
                label="Phone"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <InputField
                label="Account Type"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              />
            </div>
            <div className="flex gap-4 mt-4 justify-end">
              <Button onClick={handleSave} variant="primary">
                Save
              </Button>
              <Button onClick={handleCancel} variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="mx-auto bg-white rounded-lg border-2 border-gray-300 p-6 relative mb-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-gray-700 font-[Montserrat]">
            My Reviews
          </h2>

          <div className="flex gap-3">
            {!showAllReviews && mockReviews.length > 1 && (
              <Button
                onClick={() => setShowAllReviews(true)}
                variant="secondary"
                className="font-[Montserrat]"
              >
                Show Reviews
              </Button>
            )}

            {showAllReviews && (
              <Button
                onClick={() => setShowAllReviews(false)}
                variant="secondary"
                className="font-[Montserrat]"
              >
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="mx-auto bg-white rounded-lg flex flex-col gap-2">
          {(showAllReviews ? mockReviews : [mockReviews[0]]).map((review) => (
            <div key={review.id} className="w-full bg-white p-4">
              {/* Review Comment */}
              <p className="text-gray-700 text-sm mb-2">{review.comment}</p>

              {/* Reviewer Info */}
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <FaStar key={i} className="text-yellow-500" />
                ))}
                {Array.from({ length: 5 - review.rating }).map((_, i) => (
                  <FaStar key={i} className="text-gray-300" />
                ))}

                <span className="font-medium text-sm text-gray-700 ml-2">
                  {review.reviewerName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;

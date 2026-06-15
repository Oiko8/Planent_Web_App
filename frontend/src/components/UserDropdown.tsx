import type { User } from "../types/user";

export default function UserDropdownDetails({ user }: { user: User }) {
    return (
        <div className="admin-user-dropdown">
            <div className="admin-details-grid">

                {/* Account Info */}
                <div className="admin-details-column">
                    <h4 className="admin-column-subtitle">Account</h4>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">User ID</span>
                        <span className="admin-detail-value">#{user.userId}</span>
                    </div>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">Username</span>
                        <span className="admin-detail-value">@{user.username}</span>
                    </div>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">Account Role</span>
                        <span className="admin-detail-value">{user.isAdmin ? "Administrator" : "Standard User"}</span>
                    </div>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">Approval Status</span>
                        <span className="admin-detail-value">{user.isApproved ? "Approved" : "Pending"}</span>
                    </div>
                </div>

                {/* Personal Info */}
                <div className="admin-details-column">
                    <h4 className="admin-column-subtitle">Personal & Contact</h4>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">Full Name</span>
                        <span className="admin-detail-value">{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">Email Address</span>
                        <span className="admin-detail-value">{user.email}</span>
                    </div>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">Phone Number</span>
                        <span className="admin-detail-value">{user.phone}</span>
                    </div>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">AFM (Tax ID)</span>
                        <span className="admin-detail-value">{user.afm}</span>
                    </div>
                </div>

                {/* Location */}
                <div className="admin-details-column">
                    <h4 className="admin-column-subtitle">Location</h4>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">Street Address</span>
                        <span className="admin-detail-value">{user.address}</span>
                    </div>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">City & Country</span>
                        <span className="admin-detail-value">{user.city}, {user.country}</span>
                    </div>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">Zip Code</span>
                        <span className="admin-detail-value">{user.zipcode}</span>
                    </div>
                    <div className="admin-detail-item">
                        <span className="admin-detail-label">Coordinates</span>
                        <span className="admin-detail-value">
                            {user.latitude !== null && user.longitude !== null
                                ? `${user.latitude}, ${user.longitude}`
                                : "N/A"}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
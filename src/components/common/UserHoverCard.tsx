import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MutualFollower,
  UserFollow,
  UserSuggestion,
  UserKeyword,
  UserSearchProps,
} from "@/interfaces/connections.interfaces";

interface UserHoverCardProps {
  user:
    | MutualFollower
    | UserFollow
    | UserSuggestion
    | UserKeyword
    | UserSearchProps;
  href: string;
  avatarSize?: string;
}

const UserHoverCard: React.FC<UserHoverCardProps> = ({
  user,
  href,
  avatarSize = "w-10 h-10",
}) => {
  const hasStats = "following_number" in user && "followers_number" in user;
  const hasMutual =
    "mutual_followers_number" in user && user.mutual_followers_number > 0;
  const hasBio = "bio" in user;
  const hasSuggestionReason = "suggestion_reason" in user;
  const hasSharedInterests = "shared_interests" in user;
  const hasOnlineStatus = "is_online" in user;

  return (
    <Card className="hover:shadow-md cursor-pointer">
      <CardContent className="p-4">
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="flex items-center justify-between gap-4">
              <Link
                href={href}
                className="flex items-center gap-3 min-w-0 flex-1"
              >
                <Avatar className={`${avatarSize} border border-border`}>
                  <AvatarImage
                    src={
                      user.avatar_ipfs_hash
                        ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                        : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                    }
                    alt={user.display_name || user.username || "Avatar"}
                    className="object-contain"
                  />
                  <AvatarFallback className="text-xs">
                    {user.display_name?.charAt(0) ||
                      user.username?.charAt(0) ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.display_name || user.username}
                    </p>
                    {"is_following" in user && user.is_following && (
                      <Badge variant="secondary">Following</Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                  {hasBio && user.bio && (
                    <p className="text-sm text-foreground/90 mt-2 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                  {hasStats && hasSharedInterests && (
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-primary">
                        {(user as UserKeyword).shared_interests_count} shared
                      </span>
                      <span className="text-muted-foreground">
                        {user.followers_number} followers
                      </span>
                    </div>
                  )}
                  {hasStats && !hasSharedInterests && (
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-muted-foreground">
                        {user.followers_number} followers
                      </span>
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex flex-col items-end gap-2 ml-2">
                <Button asChild>
                  <Link href={href}>View</Link>
                </Button>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-4" side="bottom" align="start">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-16 h-16 border border-border">
                  <AvatarImage
                    src={
                      user.avatar_ipfs_hash
                        ? `https://ipfs.de-id.xyz/ipfs/${user.avatar_ipfs_hash}`
                        : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                    }
                    alt={user.display_name || user.username || "Avatar"}
                    className="object-contain"
                  />
                  <AvatarFallback>
                    {user.display_name?.charAt(0) ||
                      user.username?.charAt(0) ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground truncate">
                      {user.display_name || user.username}
                    </p>
                    {"role" in user && user.role && (
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    )}
                    {hasOnlineStatus && (
                      <FontAwesomeIcon
                        icon={faCircle}
                        className={`ml-2 ${
                          user.is_online
                            ? "text-success"
                            : "text-muted-foreground-2"
                        } text-xs`}
                        title={user.is_online ? "Online" : "Offline"}
                        aria-hidden={false}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    @{user.username}
                  </p>
                </div>
              </div>

              {hasStats && (
                <div
                  className={`grid ${
                    hasMutual ? "grid-cols-3" : "grid-cols-2"
                  } gap-2 text-center`}
                >
                  <Card className="bg-card border border-border">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">Following</p>
                      <p className="text-sm font-medium text-foreground">
                        {user.following_number}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border border-border">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">Followers</p>
                      <p className="text-sm font-medium text-foreground">
                        {user.followers_number}
                      </p>
                    </CardContent>
                  </Card>
                  {hasMutual && (
                    <Card className="bg-card border border-border">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Mutual</p>
                        <p className="text-sm font-medium text-foreground">
                          {user.mutual_followers_number}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {hasSuggestionReason && user.suggestion_reason && (
                <p className="text-sm text-foreground/90">
                  {user.suggestion_reason}
                </p>
              )}

              {hasSharedInterests && user.shared_interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {user.shared_interests.slice(0, 3).map((interest) => (
                    <Badge key={interest} variant="outline" className="text-xs">
                      {interest.replace(/_/g, " ")}
                    </Badge>
                  ))}
                  {user.shared_interests.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{user.shared_interests.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {hasMutual &&
                (user as UserFollow | UserSuggestion | UserKeyword)
                  .mutual_followers_list &&
                (user as UserFollow | UserSuggestion | UserKeyword)
                  .mutual_followers_list.length > 0 && (
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-xs text-muted-foreground">Followed by</p>
                    <div className="flex -space-x-2">
                      {(
                        user as UserFollow | UserSuggestion | UserKeyword
                      ).mutual_followers_list
                        .slice(0, 3)
                        .map((mutual) => (
                          <Avatar
                            key={mutual.user_id}
                            className="w-5 h-5 border-2 border-background"
                          >
                            <AvatarImage
                              src={
                                mutual.avatar_ipfs_hash
                                  ? `https://ipfs.de-id.xyz/ipfs/${mutual.avatar_ipfs_hash}`
                                  : "https://ipfs.de-id.xyz/ipfs/bafkreibmridohwxgfwdrju5ixnw26awr22keihoegdn76yymilgsqyx4le"
                              }
                              alt={mutual.display_name || "Avatar"}
                              className="object-contain"
                            />
                            <AvatarFallback className="text-xs">
                              {mutual.display_name?.charAt(0) ||
                                mutual.username?.charAt(0) ||
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {(
                        user as UserFollow | UserSuggestion | UserKeyword
                      ).mutual_followers_list
                        .slice(0, 2)
                        .map((m) => m.display_name)
                        .join(", ")}
                      {(user as UserFollow | UserSuggestion | UserKeyword)
                        .mutual_followers_number > 2 &&
                        ` and ${
                          (user as UserFollow | UserSuggestion | UserKeyword)
                            .mutual_followers_number - 2
                        } other${
                          (user as UserFollow | UserSuggestion | UserKeyword)
                            .mutual_followers_number -
                            2 >
                          1
                            ? "s"
                            : ""
                        }`}
                    </p>
                  </div>
                )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </CardContent>
    </Card>
  );
};

export default UserHoverCard;

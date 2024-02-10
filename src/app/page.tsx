"use client";

import { SignInButton, SignOutButton, useSession } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const { isSignedIn } = useSession();

  const createThumbnail = useMutation(api.thumbnails.createThumbnail);
  const thumbnails = useQuery(api.thumbnails.getThumbnails);

  console.log("thumbnails", thumbnails);

  return (
    <main>
      {isSignedIn ? <SignOutButton /> : <SignInButton />}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const title = formData.get("title") as string;

          await createThumbnail({ title });

          form.reset();
        }}
      >
        <label htmlFor="thumbnail">Create thumbnail</label>
        <input type="text" name="title" id="thumbnail" className="text-black" />

        <button type="submit">Send</button>
      </form>

      {thumbnails?.map((thumbnail) => (
        <div key={thumbnail.user}>{thumbnail.title}</div>
      ))}
    </main>
  );
}

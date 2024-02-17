"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UploadFileResponse } from "@xixixao/uploadstuff";
import { UploadButton } from "@xixixao/uploadstuff/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import "@xixixao/uploadstuff/react/styles.css";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { UpgradeButton } from "@/components/upgrade-button";
import { useSession } from "@clerk/nextjs";

const defaultErrorState = {
  title: "",
  imageA: "",
  imageB: "",
};

const CreatePage = () => {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createThumbnail = useMutation(api.thumbnails.createThumbnail);
  const [imageA, setImageA] = useState("");
  const [imageB, setImageB] = useState("");
  const [errors, setErrors] = useState(defaultErrorState);
  const { toast } = useToast();
  const router = useRouter();
  const { session } = useSession();

  return (
    <div className="mt-16">
      <div className="text-4xl font-bold mb-8">Create a Thumbnail Test</div>

      <p className="text-lg max-w-md mb-8">
        Create your test so other people can vote on their favorite thumbnail
        and help you redesign and pick the best options
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const title = formData.get("title") as string;

          let newErrors = { ...defaultErrorState };

          if (!title) {
            newErrors = {
              ...newErrors,
              title: "title is required",
            };
          }

          if (!imageA) {
            newErrors = {
              ...newErrors,
              imageA: "first image is required",
            };
          }

          if (!imageB) {
            newErrors = {
              ...newErrors,
              imageB: "second image is required",
            };
          }
          setErrors(newErrors);

          const hasErrors = Object.values(newErrors).some(Boolean);
          if (hasErrors) {
            toast({
              title: "Form error",
              description: "Please fill in the details correctly",
              variant: "destructive",
            });
            return;
          }

          try {
            const thumbnailId = await createThumbnail({
              title,
              imageA,
              imageB,
              profileImage: session?.user.imageUrl,
            });

            router.push(`/thumbnails/${thumbnailId}`);
          } catch (err) {
            toast({
              title: "You ran out of a free credits",
              description: (
                <div>
                  You must <UpgradeButton /> in order to create more thumbnail
                  tests
                </div>
              ),
              variant: "destructive",
            });
          }
        }}
      >
        <div className="flex flex-col w-full">
          <Label htmlFor="title" className="mb-2">
            Your test title
          </Label>
          <Input
            className={`${errors.title && "border-red-500"}`}
            type="text"
            id="title"
            name="title"
            placeholder="Label your test to make it easier to manage later"
          />
          {errors.title && (
            <Label className="border-red-500 text-red-500">
              {errors.title}
            </Label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 mt-8">
          <div
            className={clsx("flex flex-col gap-4 rounded p-2", {
              border: errors.imageA,
              "border-red-500": errors.imageA,
            })}
          >
            <h2 className="text-2xl font-bold">Text Image A</h2>

            {imageA && (
              <Image
                src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${imageA}`}
                width={600}
                height={600}
                alt="Test Image A"
              />
            )}

            <UploadButton
              uploadUrl={generateUploadUrl}
              fileTypes={["image/*"]}
              onUploadComplete={async (uploaded: UploadFileResponse[]) => {
                setImageA((uploaded[0].response as any).storageId);
              }}
              onUploadError={(error: unknown) => {
                // Do something with the error.
                alert(`ERROR! ${error}`);
              }}
            />
            {errors.imageA && (
              <Label className="border-red-500 text-red-500">
                {errors.imageA}
              </Label>
            )}
          </div>
          <div
            className={clsx("flex flex-col gap-4 rounded p-2", {
              border: errors.imageB,
              "border-red-500": errors.imageB,
            })}
          >
            <h2 className="text-2xl font-bold">Text Image B</h2>

            {imageB && (
              <Image
                src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${imageB}`}
                width={600}
                height={600}
                alt="Test Image A"
              />
            )}

            <UploadButton
              uploadUrl={generateUploadUrl}
              fileTypes={["image/*"]}
              onUploadComplete={async (uploaded: UploadFileResponse[]) => {
                setImageB((uploaded[0].response as any).storageId);
              }}
              onUploadError={(error: unknown) => {
                // Do something with the error.
                alert(`ERROR! ${error}`);
              }}
            />
            {errors.imageB && (
              <Label className="border-red-500 text-red-500">
                {errors.imageB}
              </Label>
            )}
          </div>
        </div>

        <Button className="mt-8">Create thumbnail test</Button>
      </form>
    </div>
  );
};

export default CreatePage;

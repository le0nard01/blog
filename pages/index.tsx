import { Button } from "components/button";
import { GetStaticProps } from "next";
import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Format, toPost } from "../lib/format";
import { getAllPosts, Post } from "../lib/markdown";

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllPosts([
    "slug",
    "date",
    "subjects",
    "readingTime",
    "description",
    "title",
    "image",
  ]);
  return { props: { posts } };
};

const inputName = "search";

const Subjects = ({
  subjects,
  onClick,
  search,
}: {
  subjects?: string[];
  search: string;
  onClick: (str: string) => void;
}) => {
  const id = useMemo(() => Math.random().toString(36).substr(2, 16), []);

  const list = useMemo(
    () => [...(subjects ?? [])].sort((a, b) => a.localeCompare(b)),
    [subjects]
  );

  const click = useCallback((x: string) => {
    onClick(x);
  }, []);

  return (
    <div className="prose flex gap-x-2 xl:prose-md mt-2 text-md flex-wrap gap-y-2">
      {list.map((y) => (
        <button
          onClick={() => click(y)}
          className={`${
            y === search
              ? "bg-primary-link focus:bg-primary-link"
              : "bg-primary-dark focus:bg-primary-dark"
          } hover:bg-primary duration-500 transition-colors px-2 rounded text-primary-contrast`}
          key={`${y}-${id}`}
        >
          {y}
        </button>
      ))}
    </div>
  );
};

export default function Index({ posts }: { posts: Post[] }) {
  const input = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey) {
        const key = e.key.toLowerCase();
        if ("k" === key) {
          e.preventDefault();
          input.current?.focus();
        }
      }
    });
  }, []);

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form: HTMLFormElement = e.target as never;
    const search = form.elements.namedItem(inputName) as HTMLInputElement;
    setSearch(search.value);
  }, []);

  const viewedPosts = useMemo(
    () =>
      search === ""
        ? posts
        : posts.filter((post) => {
            const lowerSearch = search.toLowerCase();
            if (post.title.toLowerCase().includes(lowerSearch)) {
              return true;
            }
            if (post.description.toLowerCase().includes(lowerSearch)) {
              return true;
            }
            return (post?.subjects ?? []).some((x) =>
              x.toLowerCase().includes(lowerSearch)
            );
          }),
    [posts, search]
  );

  const onReset = () => setSearch("");

  return (
    <div className="w-full min-w-full">
      <form onSubmit={onSubmit} onReset={onReset} className="w-full block mb-8">
        <div className="flex flex-row flex-wrap gap-2">
          <label
            className="flex flex-row items-center input-group whitespace-nowrap"
            htmlFor="search"
          >
            <input
              className="p-1 order-2 border-b border-primary-link transition-colors duration-500 text-on-base bg-transparent focus:border-primary outline-none focus:outline-none"
              id={inputName}
              defaultValue={search}
              name={inputName}
              placeholder="CTRL+K to focus..."
              ref={input}
            />
            <span className="text-lg mr-2 order-1 transition-colors duration-500">
              Find a post:{" "}
            </span>
          </label>
          <Button
            className="hover:bg-primary focus:bg-primary hover:text-primary-contrast focus:text-on-base border-primary text-primary-link w-fit"
            type="submit"
          >
            Search
          </Button>
          <Button
            className="hover:bg-warn focus:bg-warn hover:text-base focus:text-base border-warn text-warn-light w-fit"
            type="reset"
          >
            Reset
          </Button>
        </div>
      </form>
      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-12">
        {viewedPosts.map((x) => (
          <article key={x.slug} className="flex flex-col w-full">
            <header className="text-primary-link transition-colors duration-500 cursor-pointer hover:underline">
              <Link href={toPost(x.slug)}>
                <a href={toPost(x.slug)}>
                  <h3 className="text-2xl font-bold">{x.title}</h3>
                </a>
              </Link>
            </header>
            <p className="prose xl:prose-lg text-sm opacity-50 my-2">
              {Format.date(x.date)} - {x.readingTime} min read
            </p>
            <p className="prose xl:prose-lg text-md">{x.description}</p>
            <Subjects
              subjects={x.subjects}
              search={search}
              onClick={setSearch}
            />
          </article>
        ))}
      </section>
    </div>
  );
}

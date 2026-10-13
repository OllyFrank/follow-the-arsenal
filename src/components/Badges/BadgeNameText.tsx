/** Forces a two-word badge name onto two lines ("Goals" / "Galore"),
 * making better use of the card's reserved two-line name block instead of
 * sitting on one line with blank space below it. Names with a different
 * word count keep their natural wrap. */
export function BadgeNameText({ name }: { name: string }) {
  const words = name.split(" ");
  if (words.length !== 2) return <>{name}</>;
  return (
    <>
      {words[0]}
      <br />
      {words[1]}
    </>
  );
}

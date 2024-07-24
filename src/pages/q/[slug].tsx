import { useRouter } from "next/router";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useEffect, useReducer, useState, useMemo, useCallback, ChangeEvent } from "react";

type DataRow = {
    ID: string;
    Title: string;
    Acceptance: string;
    Difficulty: string;
    Frequency: string;
    LeetcodeQuestionLink: string;
    Completed?: boolean;
};

async function readCSVFile(slug: string): Promise<DataRow[]> {
    const response = await fetch(`/questions/${slug}.csv`);
    const text = await response.text();
    const lines = text.split("\n");
    const header = lines.shift()?.split(",");
    const dataRows: DataRow[] = [];

    lines.forEach((line) => {
        const values = line.split(",");
        if (values[0] === "") return;
        const row: DataRow = {
            ID: values[0],
            Title: values[1],
            Acceptance: values[2],
            Difficulty: values[3],
            Frequency: values[4],
            LeetcodeQuestionLink: values[5],
            Completed: false,
        };
        dataRows.push(row);
    });
    return dataRows;
}

const columnHelper = createColumnHelper<DataRow>();

const Page = () => {
    const router = useRouter();
    const rerender = useReducer(() => ({}), {})[1];
    const [tableData, setTableData] = useState<DataRow[]>([]);
    const [slug, setSlug] = useState("");
    const [completionStates, setCompletionStates] = useState<string[]>([]);

    const handleCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const isChecked = event.target.checked;
        setCompletionStates((prevStates) => {
            const updatedStates = isChecked
                ? [...prevStates, id]
                : prevStates.filter((stateId) => stateId !== id);
            localStorage.setItem("completionStates", JSON.stringify(updatedStates));
            return updatedStates;
        });
    }, []);

    useEffect(() => {
        if (typeof router.query.slug === "string") {
            setSlug(router.query.slug);
        }
    }, [router.query.slug]);

    useEffect(() => {
        if (slug === "") return;
        const fetchData = async () => {
            const data = await readCSVFile(slug);
            setTableData(data);
        };
        fetchData();
    }, [slug]);

    useEffect(() => {
        const savedStates = localStorage.getItem("completionStates");
        if (savedStates) {
            const parsedStates = JSON.parse(savedStates);
            setCompletionStates(parsedStates);
        }
    }, []);

    const columns = useMemo(() => [
        columnHelper.accessor("ID", {
            cell: (info) => info.getValue(),
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row.Acceptance, {
            id: "Acceptance",
            cell: (info) => <i>{info.getValue()}</i>,
            header: () => <span>Acceptance</span>,
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor("Frequency", {
            header: () => "Frequency",
            cell: (info) => info.renderValue(),
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor("Title", {
            header: () => <span>Title</span>,
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor("LeetcodeQuestionLink", {
            header: "LeetcodeQuestionLink",
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor("Difficulty", {
            header: "Difficulty",
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor("Completed", {
            header: "Completed",
            footer: (info) => info.column.id,
        }),
    ], []);

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });



    return (
        <div>

            <table>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}


                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}

                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {cell.column.id === "LeetcodeQuestionLink" ? (
                                        <a href={row.original.LeetcodeQuestionLink}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </a>
                                    ) : cell.column.id === "Completed" ? (
                                        <label htmlFor={row.original.ID}>
                                            <input
                                                type="checkbox"
                                                name={row.original.ID}
                                                checked={completionStates.includes(row.original.ID) ?? false}
                                                onChange={(e) => handleCheckboxChange(e, row.original.ID)}
                                            />
                                        </label>
                                    ) : (
                                        flexRender(cell.column.columnDef.cell, cell.getContext())
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Page;

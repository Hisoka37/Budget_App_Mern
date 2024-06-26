import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Cards from "../components/Cards.jsx";
import TransactionForm from "../components/TransactionForm.jsx";
import { MdLogout } from "react-icons/md";
import { useMutation, useQuery } from "@apollo/client";
import { LOGOUT } from "../graphql/mutations/user.mutation.js";
import toast from "react-hot-toast";
import { GET_TRANSACTIONS_STATISTICS } from "../graphql/queries/transaction.query.js";
import { GET_AUTH_USER } from '../graphql/queries/user.query.js'
import { useEffect, useState } from "react";


// const chartData = {
// 	labels: ["Saving", "Expense", "Investment"],
// 	datasets: [
// 		{
// 			label: "$",
// 			data: [13, 8, 3],
// 			backgroundColor: ["rgb(74 222 128)", "rgb(219 39 119)", "rgb(96 165 250)"],
// 			borderColor: ["rgb(74 222 128)", "rgb(219 39 119)", "rgb(96 165 250)"],
// 			spacing: 7,
// 			cutout: 130,
// 		},
// 	],
// };

ChartJS.register(ArcElement, Tooltip, Legend);

const HomePage = () => {
	const { data: authUserData } = useQuery(GET_AUTH_USER)
	const [logout, {loading}] = useMutation(LOGOUT, {
		refetchQueries: ["GetAuthUser"]
	})

	const {data} = useQuery(GET_TRANSACTIONS_STATISTICS)
	const [chartData, setChartData] = useState({
		labels: [],
		datasets: [
			{
				label: "$",
				data: [],
				backgroundColor: [],
				borderColor: [],
				spacing: 7,
				cutout: 130,
			},
		],
	});

	useEffect(() => {
		if(data?.categoryStatistics) {
			const categories = data.categoryStatistics.map((stat) => stat.category);
			const totalAmount = data.categoryStatistics.map((stat) => stat.totalAmount)

			const backgroundColors = [];
			const borderColors = [];

			categories.forEach((category) => {
				if (category === "saving") {
					backgroundColors.push("rgb(46,196,182)");
					borderColors.push("rgb(46,196,182)");
				} else if (category === "expense") {
					backgroundColors.push("rgb(231,29,54)");
					borderColors.push("rgb(231,29,54)");
				} else if (category === "investment") {
					backgroundColors.push("rgb(96 165 250)");
					borderColors.push("rgb(96 165 250)");
				}
			});

			setChartData((prev) => ({
				labels: categories,
				datasets: [
					{
						...prev.datasets[0],
						data: totalAmount,
						backgroundColor: backgroundColors,
						borderColor: borderColors,
					}
				]
			}))
		}
	}, [data]);
	const handleLogout = async () => {
		try {
			await logout()
			toast.success('Logged out successfully');
			client.resetStore()
		} catch (error) {
			console.error("Error logging out:", error)
			toast.error(error.message)
		}
	};


	return (
		<>
			<div className='flex flex-col gap-6 items-center max-w-7xl mx-auto z-20 relative justify-center'>
				<div className='flex items-center'>
					<p className='md:text-4xl text-2xl lg:text-4xl font-bold text-center relative z-50 mb-4 mr-4 bg-gradient-to-r from-rose-600 via-indigo-500 to-rose-500 inline-block text-transparent bg-clip-text'>
						our financial compass in a chaotic world
					</p>
					<img
						src={authUserData?.authUser?.profilePicture}
						className='w-11 h-11 rounded-full border cursor-pointer'
						alt='Avatar'
					/>
					{!loading && <MdLogout className='mx-2 w-5 h-5 cursor-pointer' onClick={handleLogout} />}
					{/* loading spinner */}
					{loading && <div className='w-6 h-6 border-t-2 border-b-2 mx-2 rounded-full animate-spin'></div>}
				</div>
				<div className='flex flex-wrap w-full justify-center items-center gap-6'>
					{data?.categoryStatistics?.length > 0 && (<div className='h-[330px] w-[330px] md:h-[360px] md:w-[360px]  '>
						<Doughnut data={chartData} />
					</div>)}

					<TransactionForm />
				</div>
				<Cards />
			</div>
		</>
	);
};
export default HomePage;